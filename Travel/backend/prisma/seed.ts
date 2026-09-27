import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting TravelSphere Database Seeding...");

  // Clean existing data in reverse order of foreign keys
  await prisma.notification.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.traveller.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.package.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing tables.");

  // 1. Create Users (Admin, Staff, Customers)
  const passwordHash = await bcrypt.hash("Travel@123456", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@travelsphere.com",
      password: passwordHash,
      firstName: "Alexander",
      lastName: "Vanderbilt",
      phone: "+1 (555) 987-6543",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      role: "ADMIN",
      isVerified: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@travelsphere.com",
      password: passwordHash,
      firstName: "Marcus",
      lastName: "Sterling",
      phone: "+1 (555) 456-7890",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      role: "STAFF",
      isVerified: true,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "customer@travelsphere.com",
      password: passwordHash,
      firstName: "Eleanor",
      lastName: "Vance",
      phone: "+1 (555) 123-4567",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      role: "CUSTOMER",
      isVerified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "john.doe@travelsphere.com",
      password: passwordHash,
      firstName: "Johnathan",
      lastName: "Doe",
      phone: "+1 (555) 234-5678",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      role: "CUSTOMER",
      isVerified: true,
    },
  });

  console.log("👤 Created 4 Users (Admin, Staff, 2 Customers).");

  // 2. Create Destinations
  const destinationsData = [
    {
      name: "Bali & Nusa Islands",
      country: "Indonesia",
      description: "Tropical paradise famed for lush volcanic hills, iconic terraced rice paddies, serene beaches, and sacred water temples.",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
      location: "Southeast Asia",
      category: "Beach",
      rating: 4.9,
      isFeatured: true,
    },
    {
      name: "Swiss Alps & St. Moritz",
      country: "Switzerland",
      description: "Towering snow-draped peaks, pristine turquoise alpine lakes, luxury panoramic trains, and historic chalet retreats.",
      image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
      location: "Central Europe",
      category: "Mountain",
      rating: 4.95,
      isFeatured: true,
    },
    {
      name: "Santorini & Aegean Isles",
      country: "Greece",
      description: "Whitewashed cliffside villas, cobalt-blue domes, dramatic volcanic caldera vistas, and world-renowned golden sunsets.",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
      location: "Southern Europe",
      category: "Beach",
      rating: 4.88,
      isFeatured: true,
    },
    {
      name: "Kyoto & Tokyo Golden Route",
      country: "Japan",
      description: "A harmonious fusion of thousand-year-old bamboo groves, tranquil Shinto shrines, Michelin gastronomy, and futuristic metropolis.",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      location: "East Asia",
      category: "Cultural",
      rating: 4.96,
      isFeatured: true,
    },
    {
      name: "Amalfi Coast & Capri",
      country: "Italy",
      description: "Pastel villages clinging to precipitous Mediterranean bluffs, fragrant lemon groves, and private Riva yacht excursions.",
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
      location: "Southern Europe",
      category: "Luxury",
      rating: 4.92,
      isFeatured: true,
    },
    {
      name: "Serengeti & Ngorongoro",
      country: "Tanzania",
      description: "Witness the legendary Great Migration across the endless golden savannah with private five-star luxury safari lodges.",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
      location: "East Africa",
      category: "Adventure",
      rating: 4.94,
      isFeatured: true,
    },
    {
      name: "Dubai & Desert Oasis",
      country: "United Arab Emirates",
      description: "Futuristic skyscrapers, world-class luxury shopping, starlit desert private glamping, and royal Arabian hospitality.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
      location: "Middle East",
      category: "City",
      rating: 4.85,
      isFeatured: false,
    },
    {
      name: "Reykjavik & Glacial Fjords",
      country: "Iceland",
      description: "Land of fire and ice featuring dancing aurora borealis, steaming geothermal mineral lagoons, and roaring waterfalls.",
      image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80",
      location: "Northern Europe",
      category: "Adventure",
      rating: 4.89,
      isFeatured: false,
    },
  ];

  const createdDestinations = [];
  for (const d of destinationsData) {
    const dest = await prisma.destination.create({ data: d });
    createdDestinations.push(dest);
  }
  console.log(`🏝️ Created ${createdDestinations.length} Destinations.`);

  // 3. Create Vehicles
  const vehiclesData = [
    {
      type: "VAN",
      name: "Mercedes-Benz Sprinter Executive VIP",
      capacity: 12,
      price: 350,
      driverIncluded: true,
      availability: true,
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
      features: JSON.stringify(["Leather Recliners", "Wi-Fi High Speed", "Chilled Champagne Bar", "Panoramic Roof"]),
    },
    {
      type: "CAR",
      name: "Range Rover Autobiography LWB",
      capacity: 4,
      price: 450,
      driverIncluded: true,
      availability: true,
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      features: JSON.stringify(["Executive Seating", "Massage Chairs", "Privacy Glass", "Personal Chauffeur"]),
    },
    {
      type: "BUS",
      name: "Scania Touring Deluxe Motorcoach",
      capacity: 45,
      price: 900,
      driverIncluded: true,
      availability: true,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      features: JSON.stringify(["Air Suspension", "Onboard Restroom", "Individual Audio Ports", "Luggage Bay"]),
    },
    {
      type: "AIRPORT_TRANSFER",
      name: "Tesla Model X Falcon Edition",
      capacity: 4,
      price: 180,
      driverIncluded: true,
      availability: true,
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
      features: JSON.stringify(["Zero Emissions", "Falcon Wing Doors", "Flight Tracker Sync", "Meet & Greet"]),
    },
  ];

  const createdVehicles = [];
  for (const v of vehiclesData) {
    const veh = await prisma.vehicle.create({ data: v });
    createdVehicles.push(veh);
  }
  console.log(`🚐 Created ${createdVehicles.length} Luxury Transport Vehicles.`);

  // 4. Create Luxury Hotels
  const hotelsData = [
    {
      name: "The Mulia Resort & Ocean Villas",
      destinationId: createdDestinations[0].id,
      location: "Nusa Dua, Bali",
      description: "Ultra-luxurious beachfront sanctuary boasting private cabanas, infinity pools overlooking the Indian Ocean, and butler service.",
      pricePerNight: 480,
      rooms: 24,
      rating: 4.9,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      ]),
      amenities: JSON.stringify(["Private Oceanfront Pool", "Spa & Wellness Pavilions", "8 Gourmet Dining Venues", "24/7 Butler"]),
      availability: true,
    },
    {
      name: "The Chedi Andermatt Grand Alpine",
      destinationId: createdDestinations[1].id,
      location: "Andermatt, Swiss Alps",
      description: "An Asian-inspired alpine masterpiece with wood fireplaces, hydrothermal pools, and Michelin-starred dining.",
      pricePerNight: 850,
      rooms: 16,
      rating: 4.96,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      ]),
      amenities: JSON.stringify(["Ski Butler Service", "Indoor & Outdoor Thermal Pools", "Wine & Cigar Library", "Michelin Dining"]),
      availability: true,
    },
    {
      name: "Canaves Oia Epitome Luxury Suites",
      destinationId: createdDestinations[2].id,
      location: "Oia, Santorini",
      description: "Perched above Ammoudi Bay, offering private infinity plunge pools and direct sunset panoramas from every terrace.",
      pricePerNight: 920,
      rooms: 18,
      rating: 4.94,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      ]),
      amenities: JSON.stringify(["Private Sunset Terrace", "Infinity Plunge Pool", "Sommelier Tastings", "Helicopter Transfers"]),
      availability: true,
    },
    {
      name: "Aman Tokyo & Hoshinoya Kyoto Ryokan",
      destinationId: createdDestinations[3].id,
      location: "Tokyo & Arashiyama Kyoto",
      description: "Serene urban sanctuary with soaring washi paper lanterns paired with a riverside historic ryokan accessible by wooden boat.",
      pricePerNight: 1100,
      rooms: 20,
      rating: 4.98,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      ]),
      amenities: JSON.stringify(["Private Traditional Onsen", "Kaiseki Masterclass", "Zen Rock Gardens", "Matcha Tea Pavilion"]),
      availability: true,
    },
  ];

  const createdHotels = [];
  for (const h of hotelsData) {
    const hotel = await prisma.hotel.create({ data: h });
    createdHotels.push(hotel);
  }
  console.log(`🏨 Created ${createdHotels.length} Luxury Hotels.`);

  // 5. Create Tour Packages
  const packagesData = [
    {
      title: "Ultimate Bali Heavenly Escape: Temples, Waterfalls & Private Island Catamaran",
      destinationId: createdDestinations[0].id,
      hotelId: createdHotels[0].id,
      vehicleId: createdVehicles[0].id,
      description: "Immerse yourself in divine Balinese enchantment. Traverse the iconic terraced rice emerald fields of Tegallalang, bathe in sacred holy springs at Tirta Empul, enjoy private sunset yachting along Nusa Penida's towering limestone cliffs, and unwind in world-class 5-star beachfront luxury.",
      duration: "7 Days / 6 Nights",
      durationDays: 7,
      price: 1850,
      discount: 15,
      maxPeople: 12,
      availableSeats: 8,
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80",
      ]),
      includedServices: JSON.stringify([
        "6 Nights in 5-Star Oceanfront Villa",
        "Daily Gourmet Buffet & A-la-carte Breakfast",
        "VIP Private Airport Limousine Transfer",
        "Full-Day Private Catamaran Yacht to Nusa Penida",
        "Licensed English-Speaking Cultural Heritage Guide",
        "All Sacred Temple & National Park Entrance Fees",
        "Complimentary 90-Minute Balinese Herbal Spa",
      ]),
      excludedServices: JSON.stringify([
        "International Airfare Flights",
        "Personal Travel Insurance",
        "Alcoholic Beverages outside tasting dinners",
        "Gratuities & Tips for local drivers",
      ]),
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "VIP Arrival & Beachfront Villa Check-in",
          description: "Arrive at Denpasar International Airport where your private chauffeur meets you with fresh floral frangipani leis. Transfer in executive luxury to your ocean villa in Nusa Dua. Evening sunset welcome cocktail reception by the beach.",
          meals: "Dinner Included",
          hotel: "The Mulia Resort & Ocean Villas",
        },
        {
          day: 2,
          title: "Ubud Cultural Heart & Sacred Monkey Sanctuary",
          description: "Journey into Ubud's emerald highlands. Explore the sacred Monkey Forest sanctuary, stroll through Tegallalang's dramatic rice terraces, and visit an organic coffee and cocoa plantation overlooking misted valleys.",
          meals: "Breakfast & Lunch",
          hotel: "The Mulia Resort & Ocean Villas",
        },
        {
          day: 3,
          title: "Tirta Empul Holy Water Blessing & Mount Batur Vista",
          description: "Experience an authentic Melukat purification ritual in holy mountain spring water guided by a Balinese high priest. Savor an exquisite lunch with direct panoramic views of the volcanic caldera of Mount Batur.",
          meals: "Breakfast, Lunch & Dinner",
          hotel: "The Mulia Resort & Ocean Villas",
        },
        {
          day: 4,
          title: "Private Catamaran Cruise to Nusa Penida & Snorkel with Mantas",
          description: "Board our private 45-foot luxury catamaran. Sail to crystal clear waters of Manta Point to snorkel alongside gentle giant manta rays. Visit Kelingking 'T-Rex' cliff and Diamond Beach.",
          meals: "Breakfast & Gourmet Seafood Lunch",
          hotel: "The Mulia Resort & Ocean Villas",
        },
        {
          day: 5,
          title: "Uluwatu Cliffside Temple & Kecak Fire Dance at Sunset",
          description: "Leisure morning by the private pool. In late afternoon, ascend to Uluwatu Temple perched 70 meters above crashing waves. Witness the mystical Kecak Fire Dance against a burning orange horizon followed by Jimbaran candlelit seafood dinner.",
          meals: "Breakfast & Beachfront Dinner",
          hotel: "The Mulia Resort & Ocean Villas",
        },
        {
          day: 6,
          title: "Balinese Cooking Masterclass & Royal Spa Sanctuary",
          description: "Join our Master Chef for a morning spice market harvest and private open-air culinary class. Afternoon dedicated to a 90-minute therapeutic herbal massage and flower petal bath.",
          meals: "Breakfast, Lunch & Chef's Tasting Dinner",
          hotel: "The Mulia Resort & Ocean Villas",
        },
        {
          day: 7,
          title: "Farewell Sunrise & VIP Limousine Departure",
          description: "Enjoy a final champagne breakfast on your private veranda before your chauffeur escorts you to the airport VIP lounge.",
          meals: "Breakfast Included",
          hotel: "Departure",
        },
      ]),
      status: "ACTIVE",
      featured: true,
      rating: 4.95,
      reviewCount: 38,
    },
    {
      title: "Majestic Swiss Alps & Glacier Express Grand Expedition",
      destinationId: createdDestinations[1].id,
      hotelId: createdHotels[1].id,
      vehicleId: createdVehicles[1].id,
      description: "Experience the pinnacle of European mountain wonder. Ride the iconic Glacier Express panoramic train through snowy gorges and viaducts, stay in world-renowned five-star alpine sanctuaries, and ascend to the top of Europe at Jungfraujoch.",
      duration: "8 Days / 7 Nights",
      durationDays: 8,
      price: 3450,
      discount: 10,
      maxPeople: 10,
      availableSeats: 6,
      image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1000&q=80",
      ]),
      includedServices: JSON.stringify([
        "7 Nights in 5-Star Alpine Luxury Hotels",
        "First Class Swiss Travel Rail Pass with Glacier Express Excellence Class",
        "Daily Alpine Gourmet Breakfasts & 4 Fine Dining Dinners",
        "Jungfraujoch 'Top of Europe' Cogwheel Railway & Sphinx Observatory Access",
        "Private Cheese Fondue & Wine Pairing in Historic Cellar",
        "Luggage Door-to-Door Delivery Between Resorts",
      ]),
      excludedServices: JSON.stringify([
        "International Flights",
        "Optional Helicopter Ski Flights",
        "Personal expenses and boutique shopping",
      ]),
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Zurich Arrival & Scenic Transfer to Lucerne",
          description: "Meet your alpine travel director in Zurich. Transfer along glistening Lake Lucerne to your grand historic lakefront hotel. Evening welcome dinner overlooking the Chapel Bridge.",
          meals: "Dinner Included",
          hotel: "The Chedi Andermatt",
        },
        {
          day: 2,
          title: "Mount Pilatus Golden Roundtrip & Alpine Lake Cruise",
          description: "Ascend Mount Pilatus via the world's steepest cogwheel railway. Enjoy sweeping 360-degree vistas across 73 Alpine peaks before descending via aerial cableway.",
          meals: "Breakfast & Lunch",
          hotel: "The Chedi Andermatt",
        },
        {
          day: 3,
          title: "Glacier Express Excellence Class to Zermatt",
          description: "Board the legendary Glacier Express in Excellence Class. Marvel at snow-capped valleys and the Landwasser Viaduct while savoring a 5-course gourmet menu with paired grand cru wines.",
          meals: "Breakfast & 5-Course Gourmet Lunch",
          hotel: "The Chedi Andermatt",
        },
        {
          day: 4,
          title: "Matterhorn Glacier Paradise & Gornergrat Vista",
          description: "Take Europe's highest open-air cogwheel railway up to Gornergrat (3,089m) for the iconic direct view of the jagged Matterhorn peak reflecting in Riffelsee lake.",
          meals: "Breakfast & Alpine Dinner",
          hotel: "The Chedi Andermatt",
        },
      ]),
      status: "ACTIVE",
      featured: true,
      rating: 4.98,
      reviewCount: 42,
    },
    {
      title: "Santorini Sunsets & Aegean Private Yacht Romance",
      destinationId: createdDestinations[2].id,
      hotelId: createdHotels[2].id,
      vehicleId: createdVehicles[1].id,
      description: "An incomparable romantic haven on the cliffs of the Aegean. Revel in cliffside infinity pools, sail past volcanic hot springs on a private catamaran at sunset, and dine under starlight with private sommelier tastings.",
      duration: "6 Days / 5 Nights",
      durationDays: 6,
      price: 2290,
      discount: 20,
      maxPeople: 8,
      availableSeats: 5,
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
      ]),
      includedServices: JSON.stringify([
        "5 Nights in Cliffside Cave Suite with Private Plunge Pool",
        "Daily Champagne & Organic Greek Delicacies Breakfast on Terrace",
        "Private 5-Hour Sunset Catamaran Cruise with Greek BBQ & Wine",
        "Volcanic Winery Tour with Estate Sommelier",
        "Mercedes VIP Airport / Port Transfers",
      ]),
      excludedServices: JSON.stringify([
        "International Flights",
        "Personal shopping in Oia boutiques",
        "Spa treatments outside package",
      ]),
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Arrival in Santorini & Check-in at Oia Cliffside Suite",
          description: "Arrive at Thira Airport and enjoy private transfer to Oia. Welcome bottle of chilled Assyrtiko wine waiting on your panoramic caldera terrace.",
          meals: "Welcome Drinks & Dinner",
          hotel: "Canaves Oia Epitome Luxury Suites",
        },
        {
          day: 2,
          title: "Fira to Oia Caldera Trail & Historic Akrotiri",
          description: "Private guided morning walking tour along the iconic cliff trail with views across the azure caldera. Afternoon exploration of the prehistoric ruins of Akrotiri.",
          meals: "Breakfast & Greek Mezze Lunch",
          hotel: "Canaves Oia Epitome Luxury Suites",
        },
        {
          day: 3,
          title: "Private Sunset Yacht Cruise & Thermal Springs",
          description: "Board our private luxury catamaran. Sail to the Red Beach, White Beach, and swim in volcanic sulfur hot springs. Watch the sun dip into the Aegean while enjoying grilled fresh lobster.",
          meals: "Breakfast & Seafood Yacht Dinner",
          hotel: "Canaves Oia Epitome Luxury Suites",
        },
      ]),
      status: "ACTIVE",
      featured: true,
      rating: 4.96,
      reviewCount: 29,
    },
    {
      title: "Japan Golden Route: Imperial Kyoto, Mount Fuji & Neon Tokyo",
      destinationId: createdDestinations[3].id,
      hotelId: createdHotels[3].id,
      vehicleId: createdVehicles[0].id,
      description: "An unforgettable cultural odyssey through ancient and ultra-modern Japan. Ride the Shinkansen bullet train, experience an authentic tea ceremony with a Geiko in Gion, view Mount Fuji from luxury ryokan hot springs, and explore Tokyo's Michelin culinary wonders.",
      duration: "10 Days / 9 Nights",
      durationDays: 10,
      price: 4150,
      discount: 15,
      maxPeople: 12,
      availableSeats: 7,
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
      ]),
      includedServices: JSON.stringify([
        "9 Nights in 5-Star Luxury Hotels & Traditional Onsen Ryokan",
        "First-Class Green Car JR Rail Pass for Bullet Trains",
        "Exclusive Gion Tea Ceremony with Certified Geisha",
        "Multi-Course Kaiseki Dinners paired with award-winning Sakes",
        "Private VIP Transport throughout Tokyo and Kyoto",
      ]),
      excludedServices: JSON.stringify([
        "International Flights",
        "Optional Helicopter Tokyo Night Skyline Tour",
      ]),
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Tokyo Arrival & Shinjuku Neon Welcome",
          description: "Arrive at Haneda or Narita. Private chauffeur to your luxury hotel overlooking the Imperial Palace gardens.",
          meals: "Welcome Reception",
          hotel: "Aman Tokyo",
        },
        {
          day: 2,
          title: "Old vs New: Asakusa Senso-ji & Akihabara",
          description: "Step back into the Edo period at Senso-ji temple, then immerse in modern tech and pop culture.",
          meals: "Breakfast & Sushi Omakase Lunch",
          hotel: "Aman Tokyo",
        },
      ]),
      status: "ACTIVE",
      featured: true,
      rating: 4.97,
      reviewCount: 51,
    },
    {
      title: "Great Serengeti Migration & Ngorongoro Crater VIP Safari",
      destinationId: createdDestinations[5].id,
      hotelId: null,
      vehicleId: createdVehicles[1].id,
      description: "Witness planet Earth's greatest wildlife spectacle. Embark on custom 4x4 open-roof safari expeditions tracking lions, leopards, rhinos, and millions of wildebeest crossing the Mara River, returning each evening to opulent tented suites with private plunge pools.",
      duration: "6 Days / 5 Nights",
      durationDays: 6,
      price: 4800,
      discount: 5,
      maxPeople: 8,
      availableSeats: 4,
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80",
      ]),
      includedServices: JSON.stringify([
        "5 Nights in Four Seasons Safari Lodge & Luxury Tented Camp",
        "All Game Drives in Custom Land Cruiser with Head Naturalist",
        "Dawn Hot Air Balloon Safari with Bush Champagne Breakfast",
        "All Serengeti & Ngorongoro Conservation Area Entry Permits",
        "All Gourmet Bush Meals, Premium Wines, and Spirits",
      ]),
      excludedServices: JSON.stringify([
        "International Flights into Kilimanjaro (JRO)",
        "Tanzania Tourist Visa",
        "Discretionary Ranger Tips",
      ]),
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Bush Flight into Serengeti & First Sunset Game Drive",
          description: "Board private bush plane to Seronera airstrip. Afternoon game drive discovering prides of lions on kopjes.",
          meals: "Lunch & Bushfire Dinner",
          hotel: "Four Seasons Safari Lodge",
        },
      ]),
      status: "ACTIVE",
      featured: false,
      rating: 4.99,
      reviewCount: 22,
    },
    {
      title: "Amalfi Coast Dolce Vita: Cliffside Villas & Capri Private Cruise",
      destinationId: createdDestinations[4].id,
      hotelId: null,
      vehicleId: createdVehicles[1].id,
      description: "Live the authentic Italian high life along the dramatic Mediterranean coastline. Savor fresh limoncello in Ravello, cruise on a private Riva yacht through the Faraglioni rock arches of Capri, and dine at cliffside Michelin stars.",
      duration: "7 Days / 6 Nights",
      durationDays: 7,
      price: 3200,
      discount: 10,
      maxPeople: 10,
      availableSeats: 6,
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
      ]),
      includedServices: JSON.stringify([
        "6 Nights in Positano Luxury Cliff Villa",
        "Private Full Day Capri Cruise on classic Italian Riva boat",
        "Private Wine & Limoncello Tasting at Ravello Vineyards",
        "Chauffeured Mercedes along the Amalfi scenic coastal drive",
      ]),
      excludedServices: JSON.stringify([
        "International Flights",
        "Personal shopping in Capri boutiques",
      ]),
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Naples to Positano Along the Amalfi Cliff Road",
          description: "Private chauffeur transfer from Naples Airport. Savor sunset Aperol Spritz on your terrace.",
          meals: "Welcome Dinner",
          hotel: "Le Sirenuse Positano",
        },
      ]),
      status: "ACTIVE",
      featured: true,
      rating: 4.93,
      reviewCount: 31,
    },
  ];

  const createdPackages = [];
  for (const p of packagesData) {
    // If excludedServices is an array or string, ensure it's a JSON string
    if (typeof p.excludedServices !== 'string') {
      p.excludedServices = JSON.stringify(p.excludedServices);
    }
    const pkg = await prisma.package.create({ data: p });
    createdPackages.push(pkg);
  }
  console.log(`✈️ Created ${createdPackages.length} Tour Packages.`);

  // 6. Create Coupons
  const couponsData = [
    {
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minPurchase: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      timesUsed: 14,
      isActive: true,
    },
    {
      code: "LUXURY250",
      discountType: "FIXED",
      discountValue: 250,
      minPurchase: 2000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      timesUsed: 8,
      isActive: true,
    },
    {
      code: "SUMMER25",
      discountType: "PERCENTAGE",
      discountValue: 25,
      minPurchase: 1500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: 50,
      timesUsed: 3,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.create({ data: c });
  }
  console.log(`🏷️ Created ${couponsData.length} Discount Coupons.`);

  // 7. Create Demo Bookings, Travellers & Payments
  const booking1 = await prisma.booking.create({
    data: {
      bookingNumber: "TS-2026-8491",
      customerId: customer1.id,
      packageId: createdPackages[0].id,
      staffId: staff.id,
      bookingDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      travelDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
      numberOfPeople: 2,
      totalPrice: 3700,
      discountAmount: 555, // 15% package discount
      finalPrice: 3145,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequests: "Anniversary celebration. Please arrange fresh frangipani decorations in master bedroom.",
      operationsNotes: "VIP couple, honeymoon package amenities assigned. Chauffeur assigned: Made Subawa.",
      travellers: {
        create: [
          {
            fullName: "Eleanor Vance",
            email: "customer@travelsphere.com",
            phone: "+1 (555) 123-4567",
            passportNumber: "US984729104",
            age: 32,
            gender: "Female",
            isLead: true,
          },
          {
            fullName: "Julian Vance",
            email: "julian.vance@example.com",
            phone: "+1 (555) 123-4568",
            passportNumber: "US984729105",
            age: 35,
            gender: "Male",
            isLead: false,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 3145,
            method: "CARD",
            transactionId: "TXN_STRIPE_9837264819",
            status: "SUCCESS",
            notes: "Visa ending in 4242 approved.",
          },
        ],
      },
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      bookingNumber: "TS-2026-9022",
      customerId: customer2.id,
      packageId: createdPackages[1].id,
      staffId: staff.id,
      bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      travelDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      numberOfPeople: 1,
      totalPrice: 3450,
      discountAmount: 345,
      finalPrice: 3105,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequests: "Window seat requested on Glacier Express Excellence Class.",
      travellers: {
        create: [
          {
            fullName: "Johnathan Doe",
            email: "john.doe@travelsphere.com",
            phone: "+1 (555) 234-5678",
            passportNumber: "UK77625149",
            age: 41,
            gender: "Male",
            isLead: true,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 3105,
            method: "BANK_TRANSFER",
            transactionId: "TXN_WIRE_887192847",
            status: "SUCCESS",
            notes: "International SWIFT transfer received and cleared.",
          },
        ],
      },
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      bookingNumber: "TS-2026-9533",
      customerId: customer1.id,
      packageId: createdPackages[2].id,
      staffId: null,
      bookingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      travelDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() + 66 * 24 * 60 * 60 * 1000),
      numberOfPeople: 2,
      totalPrice: 4580,
      discountAmount: 916,
      finalPrice: 3664,
      status: "PENDING",
      paymentStatus: "UNPAID",
      specialRequests: "Dietary requirement: Pescatarian / Vegetarian options preferred.",
      travellers: {
        create: [
          {
            fullName: "Eleanor Vance",
            email: "customer@travelsphere.com",
            phone: "+1 (555) 123-4567",
            passportNumber: "US984729104",
            age: 32,
            gender: "Female",
            isLead: true,
          },
        ],
      },
    },
  });

  console.log(`📑 Created 3 Demo Bookings with Travellers and Payments.`);

  // 8. Create Reviews
  await prisma.review.createMany({
    data: [
      {
        userId: customer1.id,
        packageId: createdPackages[0].id,
        rating: 5,
        comment: "An otherworldly luxury experience! From our arrival in Bali with private frangipani leis to the private catamaran cruise to Nusa Penida, everything was orchestrated flawlessly by TravelSphere.",
        isApproved: true,
      },
      {
        userId: customer2.id,
        packageId: createdPackages[1].id,
        rating: 5,
        comment: "The Glacier Express Excellence Class was the single greatest railway experience of my life. The Chedi Andermatt was breathtaking. 10/10 service from the TravelSphere concierge team.",
        isApproved: true,
      },
      {
        userId: customer1.id,
        packageId: createdPackages[2].id,
        rating: 5,
        comment: "Watching the sun melt into the Aegean sea from our private plunge pool in Oia was pure magic. TravelSphere handled every small detail with impeccable precision.",
        isApproved: true,
      },
    ],
  });
  console.log("⭐ Created Sample Customer Reviews.");

  // 9. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        title: "Booking Confirmed #TS-2026-8491",
        message: "Your luxury escape to Bali has been confirmed. Your assigned travel specialist is Marcus Sterling.",
        type: "BOOKING",
        isRead: false,
        link: "/dashboard",
      },
      {
        userId: customer1.id,
        title: "Exclusive Member Discount",
        message: "Use code LUXURY250 for $250 off any European package booked this month.",
        type: "PROMO",
        isRead: false,
        link: "/packages",
      },
      {
        userId: admin.id,
        title: "New Booking Notification",
        message: "Booking TS-2026-9533 submitted by Eleanor Vance for Santorini Sunsets.",
        type: "BOOKING",
        isRead: false,
        link: "/admin/bookings",
      },
    ],
  });
  console.log("🔔 Created Demo Notifications.");

  // 10. Create Favourites
  await prisma.favourite.createMany({
    data: [
      {
        userId: customer1.id,
        packageId: createdPackages[1].id,
      },
      {
        userId: customer1.id,
        packageId: createdPackages[3].id,
      },
    ],
  });
  console.log("❤️ Created Customer Favourites.");

  console.log("✅ TravelSphere database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
