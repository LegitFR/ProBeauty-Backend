import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create Users
  const users = await Promise.all([
    // Salon Owners
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1234567890',
        role: 'salon_owner',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        phone: '+1234567891',
        role: 'salon_owner',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Emma Williams',
        email: 'emma.williams@example.com',
        phone: '+1234567892',
        role: 'salon_owner',
      },
    }),
    // Staff Members
    prisma.user.create({
      data: {
        name: 'Jessica Martinez',
        email: 'jessica.martinez@example.com',
        phone: '+1234567893',
        role: 'stylist',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Brown',
        email: 'david.brown@example.com',
        phone: '+1234567894',
        role: 'stylist',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Olivia Davis',
        email: 'olivia.davis@example.com',
        phone: '+1234567895',
        role: 'nail_technician',
      },
    }),
    prisma.user.create({
      data: {
        name: 'James Wilson',
        email: 'james.wilson@example.com',
        phone: '+1234567896',
        role: 'barber',
      },
    }),
    // Customers
    prisma.user.create({
      data: {
        name: 'Alice Cooper',
        email: 'alice.cooper@example.com',
        phone: '+1234567897',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        phone: '+1234567898',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carol White',
        email: 'carol.white@example.com',
        phone: '+1234567899',
        role: 'customer',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create Salons
  const salons = await Promise.all([
    prisma.salon.create({
      data: {
        ownerId: users[0].id, // Sarah Johnson
        name: 'Glamour Studio',
        address: '123 Main Street, New York, NY 10001',
        geo: {
          type: 'Point',
          coordinates: [-73.935242, 40.73061],
        },
        hours: {
          monday: { open: '09:00', close: '20:00' },
          tuesday: { open: '09:00', close: '20:00' },
          wednesday: { open: '09:00', close: '20:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '10:00', close: '18:00' },
          sunday: { open: '10:00', close: '17:00' },
        },
        verified: true,
      },
    }),
    prisma.salon.create({
      data: {
        ownerId: users[1].id, // Michael Chen
        name: 'Urban Cuts & Color',
        address: '456 Broadway, Los Angeles, CA 90012',
        geo: {
          type: 'Point',
          coordinates: [-118.243683, 34.052235],
        },
        hours: {
          monday: { open: '08:00', close: '19:00' },
          tuesday: { open: '08:00', close: '19:00' },
          wednesday: { open: '08:00', close: '19:00' },
          thursday: { open: '08:00', close: '20:00' },
          friday: { open: '08:00', close: '20:00' },
          saturday: { open: '09:00', close: '18:00' },
          sunday: { closed: true },
        },
        verified: true,
      },
    }),
    prisma.salon.create({
      data: {
        ownerId: users[2].id, // Emma Williams
        name: 'The Beauty Lounge',
        address: '789 Oak Avenue, Chicago, IL 60601',
        geo: {
          type: 'Point',
          coordinates: [-87.629799, 41.878113],
        },
        hours: {
          monday: { open: '10:00', close: '19:00' },
          tuesday: { open: '10:00', close: '19:00' },
          wednesday: { open: '10:00', close: '19:00' },
          thursday: { open: '10:00', close: '20:00' },
          friday: { open: '10:00', close: '20:00' },
          saturday: { open: '09:00', close: '17:00' },
          sunday: { open: '11:00', close: '16:00' },
        },
        verified: false,
      },
    }),
  ]);

  console.log(`✅ Created ${salons.length} salons`);

  // Create Staff
  const staff = await Promise.all([
    // Glamour Studio Staff
    prisma.staff.create({
      data: {
        salonId: salons[0].id,
        userId: users[3].id, // Jessica Martinez
        role: 'senior_stylist',
        availability: {
          monday: ['09:00-17:00'],
          tuesday: ['09:00-17:00'],
          wednesday: ['09:00-17:00'],
          thursday: ['09:00-17:00'],
          friday: ['09:00-17:00'],
        },
      },
    }),
    prisma.staff.create({
      data: {
        salonId: salons[0].id,
        userId: users[4].id, // David Brown
        role: 'stylist',
        availability: {
          tuesday: ['10:00-18:00'],
          wednesday: ['10:00-18:00'],
          thursday: ['10:00-18:00'],
          friday: ['10:00-18:00'],
          saturday: ['10:00-18:00'],
        },
      },
    }),
    // Urban Cuts & Color Staff
    prisma.staff.create({
      data: {
        salonId: salons[1].id,
        userId: users[5].id, // Olivia Davis
        role: 'nail_technician',
        availability: {
          monday: ['08:00-16:00'],
          tuesday: ['08:00-16:00'],
          wednesday: ['08:00-16:00'],
          thursday: ['08:00-16:00'],
          friday: ['08:00-16:00'],
        },
      },
    }),
    // The Beauty Lounge Staff
    prisma.staff.create({
      data: {
        salonId: salons[2].id,
        userId: users[6].id, // James Wilson
        role: 'barber',
        availability: {
          monday: ['10:00-19:00'],
          tuesday: ['10:00-19:00'],
          thursday: ['10:00-20:00'],
          friday: ['10:00-20:00'],
          saturday: ['09:00-17:00'],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${staff.length} staff members`);

  // Create Services
  const services = await Promise.all([
    // Glamour Studio Services
    prisma.service.create({
      data: {
        salonId: salons[0].id,
        title: "Women's Haircut",
        durationMinutes: 60,
        price: 65.0,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salons[0].id,
        title: 'Hair Color - Full',
        durationMinutes: 120,
        price: 150.0,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salons[0].id,
        title: 'Balayage Highlights',
        durationMinutes: 180,
        price: 220.0,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salons[0].id,
        title: 'Blowout',
        durationMinutes: 45,
        price: 45.0,
      },
    }),
    // Urban Cuts & Color Services
    prisma.service.create({
      data: {
        salonId: salons[1].id,
        title: "Men's Haircut",
        durationMinutes: 45,
        price: 35.0,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salons[1].id,
        title: 'Manicure',
        durationMinutes: 45,
        price: 30.0,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salons[1].id,
        title: 'Gel Manicure',
        durationMinutes: 60,
        price: 45.0,
      },
    }),
    // The Beauty Lounge Services
    prisma.service.create({
      data: {
        salonId: salons[2].id,
        title: 'Beard Trim & Shape',
        durationMinutes: 30,
        price: 25.0,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salons[2].id,
        title: 'Hot Towel Shave',
        durationMinutes: 45,
        price: 40.0,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // Create Additional Salons for Enhanced Sample Data
  const additionalSalons = await Promise.all([
    prisma.salon.create({
      data: {
        ownerId: users[0].id, // Sarah Johnson
        name: 'Luxe Hair & Spa',
        address: '321 Fifth Avenue, New York, NY 10016',
        geo: {
          latitude: 40.7614,
          longitude: -73.9776,
        },
        hours: {
          monday: { open: '10:00', close: '20:00' },
          tuesday: { open: '10:00', close: '20:00' },
          wednesday: { open: '10:00', close: '20:00' },
          thursday: { open: '10:00', close: '21:00' },
          friday: { open: '10:00', close: '21:00' },
          saturday: { open: '09:00', close: '19:00' },
          sunday: { open: '11:00', close: '18:00' },
        },
        verified: true,
        images: [
          'https://images.unsplash.com/photo-1633612286906-04c2b6b35e22?w=500&h=400&fit=crop',
          'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&h=400&fit=crop',
        ],
      },
    }),
    prisma.salon.create({
      data: {
        ownerId: users[1].id, // Michael Chen
        name: 'Prime Beauty Collective',
        address: '2150 Wilshire Boulevard, Beverly Hills, CA 90211',
        geo: {
          latitude: 34.0752,
          longitude: -118.4009,
        },
        hours: {
          monday: { open: '09:00', close: '19:00' },
          tuesday: { open: '09:00', close: '19:00' },
          wednesday: { open: '09:00', close: '19:00' },
          thursday: { open: '09:00', close: '20:00' },
          friday: { open: '09:00', close: '20:00' },
          saturday: { open: '09:00', close: '18:00' },
          sunday: { open: '10:00', close: '17:00' },
        },
        verified: true,
        images: [
          'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=400&fit=crop',
          'https://images.unsplash.com/photo-1570541308623-37c24fb2638f?w=500&h=400&fit=crop',
        ],
      },
    }),
  ]);

  const allSalons = [...salons, ...additionalSalons];
  console.log(`✅ Created ${additionalSalons.length} additional salons`);

  // Create Products
  const products = await Promise.all([
    // Glamour Studio Products
    prisma.product.create({
      data: {
        salonId: salons[0].id,
        title: 'Professional Shampoo - 16oz',
        sku: 'SHMP-001',
        price: 28.0,
        quantity: 50,
        images: [
          'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=400&fit=crop',
        ],
      },
    }),
    prisma.product.create({
      data: {
        salonId: salons[0].id,
        title: 'Argan Oil Hair Serum',
        sku: 'SERUM-001',
        price: 35.0,
        quantity: 30,
        images: [
          'https://images.unsplash.com/photo-1599599810694-b5ac4dd33fdf?w=500&h=400&fit=crop',
        ],
      },
    }),
    prisma.product.create({
      data: {
        salonId: salons[0].id,
        title: 'Heat Protection Spray',
        sku: 'SPRAY-001',
        price: 22.0,
        quantity: 40,
        images: [
          'https://images.unsplash.com/photo-1631730486211-cd20e1f60154?w=500&h=400&fit=crop',
        ],
      },
    }),
    // Urban Cuts & Color Products
    prisma.product.create({
      data: {
        salonId: salons[1].id,
        title: 'Nail Polish - Ruby Red',
        sku: 'NPOL-001',
        price: 12.0,
        quantity: 100,
        images: [
          'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=400&fit=crop',
        ],
      },
    }),
    prisma.product.create({
      data: {
        salonId: salons[1].id,
        title: 'Cuticle Oil',
        sku: 'COIL-001',
        price: 15.0,
        quantity: 60,
        images: [
          'https://images.unsplash.com/photo-1608309168355-56ac2c1b67c7?w=500&h=400&fit=crop',
        ],
      },
    }),
    // The Beauty Lounge Products
    prisma.product.create({
      data: {
        salonId: salons[2].id,
        title: 'Beard Oil - Sandalwood',
        sku: 'BERD-001',
        price: 25.0,
        quantity: 35,
        images: [
          'https://images.unsplash.com/photo-1596728846592-c0d0e5007ead?w=500&h=400&fit=crop',
        ],
      },
    }),
    prisma.product.create({
      data: {
        salonId: salons[2].id,
        title: 'Styling Pomade',
        sku: 'POMD-001',
        price: 18.0,
        quantity: 45,
        images: [
          'https://images.unsplash.com/photo-1631730486211-cd20e1f60154?w=500&h=400&fit=crop',
        ],
      },
    }),
    // Luxe Hair & Spa Products
    prisma.product.create({
      data: {
        salonId: additionalSalons[0].id,
        title: 'Premium Hydrating Conditioner',
        sku: 'COND-LUXE-001',
        price: 42.0,
        quantity: 25,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=400&fit=crop',
          'https://images.unsplash.com/photo-1617278054385-cbb4db1a8a2c?w=500&h=400&fit=crop',
        ],
      },
    }),
    prisma.product.create({
      data: {
        salonId: additionalSalons[0].id,
        title: 'Luxury Hair Mask - Keratin',
        sku: 'MASK-LUXE-001',
        price: 48.0,
        quantity: 20,
        images: [
          'https://images.unsplash.com/photo-1570541308623-37c24fb2638f?w=500&h=400&fit=crop',
        ],
      },
    }),
    prisma.product.create({
      data: {
        salonId: additionalSalons[0].id,
        title: 'Silk Pillowcase - Sleep Package',
        sku: 'PILLOWCASE-LUXE-001',
        price: 55.0,
        quantity: 15,
        images: [
          'https://images.unsplash.com/photo-1607622814075-e51df1bdc82f?w=500&h=400&fit=crop',
        ],
      },
    }),
    // Prime Beauty Collective Products
    prisma.product.create({
      data: {
        salonId: additionalSalons[1].id,
        title: 'Diamond Facial Serum - Premium',
        sku: 'SERUM-PRIME-001',
        price: 85.0,
        quantity: 18,
        images: [
          'https://images.unsplash.com/photo-1611936281663-a2fcca488ddd?w=500&h=400&fit=crop',
          'https://images.unsplash.com/photo-1596728846592-c0d0e5007ead?w=500&h=400&fit=crop',
        ],
      },
    }),
    prisma.product.create({
      data: {
        salonId: additionalSalons[1].id,
        title: 'Collagen Face Mask - 24K Gold',
        sku: 'MASK-PRIME-001',
        price: 65.0,
        quantity: 22,
        images: [
          'https://images.unsplash.com/photo-1607554886223-403bdd3b808d?w=500&h=400&fit=crop',
        ],
      },
    }),
    prisma.product.create({
      data: {
        salonId: additionalSalons[1].id,
        title: 'Volumizing Hair Treatment Oil',
        sku: 'OIL-PRIME-001',
        price: 52.0,
        quantity: 30,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=400&fit=crop',
          'https://images.unsplash.com/photo-1631730486211-cd20e1f60154?w=500&h=400&fit=crop',
        ],
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create Bookings
  const now = new Date();
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        userId: users[7].id, // Alice Cooper
        salonId: salons[0].id,
        serviceId: services[0].id,
        staffId: staff[0].id,
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
        status: 'confirmed',
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[8].id, // Bob Smith
        salonId: salons[1].id,
        serviceId: services[4].id,
        staffId: staff[2].id,
        startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // +45 mins
        status: 'confirmed',
      },
    }),
    prisma.booking.create({
      data: {
        userId: users[9].id, // Carol White
        salonId: salons[2].id,
        serviceId: services[7].id,
        staffId: staff[3].id,
        startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // +30 mins
        status: 'completed',
      },
    }),
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);

  // Create Orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[7].id, // Alice Cooper
        salonId: salons[0].id,
        total: 63.0,
        status: 'completed',
      },
    }),
    prisma.order.create({
      data: {
        userId: users[8].id, // Bob Smith
        salonId: salons[1].id,
        total: 27.0,
        status: 'processing',
      },
    }),
  ]);

  console.log(`✅ Created ${orders.length} orders`);

  // Create Order Items
  const orderItems = await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 2,
        unitPrice: 28.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[2].id,
        quantity: 1,
        unitPrice: 22.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[3].id,
        quantity: 1,
        unitPrice: 12.0,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[4].id,
        quantity: 1,
        unitPrice: 15.0,
      },
    }),
  ]);

  console.log(`✅ Created ${orderItems.length} order items`);

  // Create Payments
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        orderId: orders[0].id,
        provider: 'stripe',
        amount: 63.0,
        status: 'completed',
        txnId: 'txn_1234567890abcdef',
      },
    }),
    prisma.payment.create({
      data: {
        orderId: orders[1].id,
        provider: 'paypal',
        amount: 27.0,
        status: 'pending',
        txnId: 'PAYID-ABC123XYZ',
      },
    }),
  ]);

  console.log(`✅ Created ${payments.length} payments`);

  // Create Reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[7].id, // Alice Cooper
        salonId: salons[0].id,
        serviceId: services[0].id,
        rating: 5,
        comment:
          'Amazing service! Jessica did a fantastic job with my haircut. Will definitely be back!',
      },
    }),
    prisma.review.create({
      data: {
        userId: users[8].id, // Bob Smith
        salonId: salons[1].id,
        productId: products[3].id,
        rating: 4,
        comment: 'Great color, lasts long. Would recommend!',
      },
    }),
    prisma.review.create({
      data: {
        userId: users[9].id, // Carol White
        salonId: salons[2].id,
        serviceId: services[7].id,
        rating: 5,
        comment: "James is a master barber! Best beard trim I've ever had.",
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // Create Carts
  const carts = await Promise.all([
    prisma.cart.create({
      data: {
        userId: users[9].id, // Carol White
      },
    }),
  ]);

  console.log(`✅ Created ${carts.length} carts`);

  // Create Cart Items
  const cartItems = await Promise.all([
    prisma.cartItem.create({
      data: {
        cartId: carts[0].id,
        productId: products[5].id,
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        cartId: carts[0].id,
        productId: products[6].id,
        quantity: 2,
      },
    }),
  ]);

  console.log(`✅ Created ${cartItems.length} cart items`);

  // Create Notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[7].id, // Alice Cooper
        title: 'Booking Confirmed',
        message:
          "Your booking at Glamour Studio for Women's Haircut is confirmed for tomorrow at 2:00 PM.",
        type: 'booking',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[8].id, // Bob Smith
        title: 'Order Shipped',
        message: 'Your order #12345 has been shipped and will arrive in 3-5 business days.',
        type: 'order',
        isRead: true,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[9].id, // Carol White
        title: 'New Promotion',
        message: 'The Beauty Lounge has a new promotion! Get 15% off your next visit.',
        type: 'promotion',
        isRead: false,
      },
    }),
  ]);

  console.log(`✅ Created ${notifications.length} notifications`);

  console.log('🎉 Seed completed successfully!');
  console.log(`
  📊 Summary:
  - ${users.length} users
  - ${allSalons.length} salons (${salons.length} original + ${additionalSalons.length} premium)
  - ${staff.length} staff members
  - ${services.length} services
  - ${products.length} products
  - ${bookings.length} bookings
  - ${orders.length} orders
  - ${orderItems.length} order items
  - ${payments.length} payments
  - ${reviews.length} reviews
  - ${carts.length} carts
  - ${cartItems.length} cart items
  - ${notifications.length} notifications
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
