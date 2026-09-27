const http = require('http');

async function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 STARTING TRAVELSPHERE COMPREHENSIVE E2E VERIFICATION");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    assert(health.status === 200 && health.body.status === 'healthy', 'Backend health check returns healthy status');

    // 2. Admin Login
    const adminLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@travelsphere.com', password: 'Travel@123456' }
    );
    assert(adminLogin.status === 200 && adminLogin.body.data.user.role === 'ADMIN', 'Admin login successful with ADMIN role');
    const adminToken = adminLogin.body.data.accessToken;

    // 3. Customer Login
    const customerLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'customer@travelsphere.com', password: 'Travel@123456' }
    );
    assert(customerLogin.status === 200 && customerLogin.body.data.user.role === 'CUSTOMER', 'Customer login successful with CUSTOMER role');
    const customerToken = customerLogin.body.data.accessToken;

    // 4. Staff Login
    const staffLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'staff@travelsphere.com', password: 'Travel@123456' }
    );
    assert(staffLogin.status === 200 && staffLogin.body.data.user.role === 'STAFF', 'Staff login successful with STAFF role');
    const staffToken = staffLogin.body.data.accessToken;

    // 5. Fetch Destinations
    const destinations = await request({ hostname: 'localhost', port: 5000, path: '/api/destinations', method: 'GET' });
    assert(destinations.status === 200 && destinations.body.data.length >= 8, `Destinations catalog contains ${destinations.body.data.length} destinations`);
    const sampleDest = destinations.body.data[0];

    // 6. Fetch Packages
    const packages = await request({ hostname: 'localhost', port: 5000, path: '/api/packages', method: 'GET' });
    assert(packages.status === 200 && packages.body.data.length >= 6, `Tour packages catalog contains ${packages.body.data.length} packages`);
    const samplePackage = packages.body.data[0];

    // 7. Validate Coupon Code
    const couponVal = await request(
      { hostname: 'localhost', port: 5000, path: '/api/coupons/validate', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { code: 'WELCOME10', amount: 3000 }
    );
    assert(couponVal.status === 200 && couponVal.body.data.calculatedDiscount === 300, 'Coupon validation WELCOME10 calculated 10% discount correctly ($300)');

    // 8. Multi-Step Booking Creation
    const travelDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newBookingRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/bookings',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      },
      {
        packageId: samplePackage.id,
        travelDate,
        numberOfPeople: 2,
        couponCode: 'WELCOME10',
        specialRequests: 'Window seats and quiet ocean view preferred.',
        travellers: [
          { fullName: 'Eleanor Vance', email: 'customer@travelsphere.com', phone: '+15551234567', passportNumber: 'P984129', isLead: true },
          { fullName: 'Arthur Pendelton', passportNumber: 'P984130', isLead: false },
        ],
      }
    );
    assert(newBookingRes.status === 201 && newBookingRes.body.data.bookingNumber.startsWith('TS-'), `Booking created successfully #${newBookingRes.body?.data?.bookingNumber}`);
    const createdBooking = newBookingRes.body.data;

    // 9. Payment Confirmation
    const paymentRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/payments/confirm',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      },
      {
        bookingId: createdBooking.id,
        method: 'CARD',
        transactionId: `TXN_E2E_${Date.now()}`,
        notes: 'Automated test settlement',
      }
    );
    assert(paymentRes.status === 200 && paymentRes.body.data.status === 'SUCCESS', 'Payment confirmation executed and marked SUCCESS');

    // 10. Invoice Data & PDF Download
    const invoiceRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/payments/invoice/${createdBooking.id}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${customerToken}` },
      },
      null
    );
    assert(invoiceRes.status === 200 && invoiceRes.body.data.paymentStatus === 'PAID', 'Invoice data fetched and shows PAID status');

    const pdfRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/payments/invoice/${createdBooking.id}/pdf`,
        method: 'GET',
        headers: { Authorization: `Bearer ${customerToken}` },
      },
      null
    );
    assert(pdfRes.status === 200 && pdfRes.headers['content-type'] === 'application/pdf', 'Official PDF invoice generated and returned with Content-Type application/pdf');

    // 11. Staff Portal Operations
    const staffBookings = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/bookings/staff/assigned',
        method: 'GET',
        headers: { Authorization: `Bearer ${staffToken}` },
      },
      null
    );
    assert(staffBookings.status === 200 && staffBookings.body.data.length > 0, `Staff portal queries assigned operations (${staffBookings.body.data.length} bookings)`);

    const updateStatus = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/bookings/${createdBooking.id}/status`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${staffToken}` },
      },
      { status: 'CONFIRMED' }
    );
    assert(updateStatus.status === 200 && updateStatus.body.data.status === 'CONFIRMED', 'Staff updated booking status to CONFIRMED');

    // 12. Admin Dashboard Stats
    const adminStats = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/dashboard',
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      null
    );
    assert(adminStats.status === 200 && adminStats.body.data.cards.totalRevenue > 0, `Admin stats verified: $${adminStats.body.data.cards.totalRevenue} total revenue`);

    // 13. Reports CSV Export
    const csvExport = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/reports/export/bookings',
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      null
    );
    assert(csvExport.status === 200 && csvExport.headers['content-type'].includes('text/csv'), 'Admin bookings CSV report exported successfully');

    // 14. Frontend Next.js Server check
    const frontendRes = await request({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' }, null);
    assert(frontendRes.status === 200 && frontendRes.raw.includes('Explore The World'), 'Frontend Next.js server serves luxury homepage with Hero heading');

    console.log("==================================================");
    console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runTests();
