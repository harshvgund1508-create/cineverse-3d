import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CineVerse 3D database...');

  // Clean existing data
  await prisma.ticket.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.bookingSeat.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.seatLock.deleteMany({});
  await prisma.showSeat.deleteMany({});
  await prisma.show.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.seatCategory.deleteMany({});
  await prisma.auditorium.deleteMany({});
  await prisma.cinema.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'CineVerse Director',
      email: 'admin@cineverse.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      phone: '+91 98765 43210',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Harshvardhan Gund',
      email: 'user@cineverse.com',
      passwordHash: passwordHash,
      role: 'USER',
      phone: '+91 91234 56789',
    },
  });

  console.log('Created Users: Admin & Demo User');

  // 2. Seat Categories (Exact match for 3D booking viral UI)
  const catClassic = await prisma.seatCategory.create({
    data: {
      name: 'Classic',
      basePrice: 160,
      color: '#0EA5E9',
      description: 'Front rows - big screen energy',
    },
  });

  const catPrime = await prisma.seatCategory.create({
    data: {
      name: 'Prime',
      basePrice: 220,
      color: '#10B981',
      description: 'Sweet spot for sound & picture',
    },
  });

  const catBalcony = await prisma.seatCategory.create({
    data: {
      name: 'Balcony',
      basePrice: 280,
      color: '#8B5CF6',
      description: 'Elevated view - centre aligned',
    },
  });

  const catRoyalRecliner = await prisma.seatCategory.create({
    data: {
      name: 'Royal Recliner',
      basePrice: 480,
      color: '#EAB308',
      description: 'Motorised recliners - F&B to seat',
    },
  });

  console.log('Created Seat Categories (Classic, Prime, Balcony, Royal Recliner)');

  // 3. Cinemas
  const cinema1 = await prisma.cinema.create({
    data: {
      name: 'Starlight Cinemas: MG Road',
      city: 'Bengaluru',
      address: '1 MG-Lido Mall, Trinity Circle, MG Road, Bengaluru',
      facilities: '4DX Dynamic Motion, Dolby Atmos, Luxury Lounges, In-seat Gourmet Dining',
      imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop',
    },
  });

  const cinema2 = await prisma.cinema.create({
    data: {
      name: 'CineVerse Grand IMAX',
      city: 'Mumbai',
      address: 'Phoenix Palladium, Senapati Bapat Marg, Lower Parel, Mumbai',
      facilities: 'IMAX Laser 3D, Dolby Atmos 128ch, Recliner Pods, Gourmet Dining, Valet',
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    },
  });

  // 4. Auditoriums
  const audi1 = await prisma.auditorium.create({
    data: {
      cinemaId: cinema1.id,
      name: 'Auditorium 1 - 4DX Screen',
      screenType: '4DX Dynamic Laser Screen',
      soundSystem: 'Dolby Atmos 128 Object Audio',
      totalRows: 10,
      totalCols: 14,
    },
  });

  const audi2 = await prisma.auditorium.create({
    data: {
      cinemaId: cinema2.id,
      name: 'Screen 1 - IMAX Grand Laser',
      screenType: 'IMAX Laser 1.90:1 Giant Screen',
      soundSystem: 'IMAX 12-Channel Immersive Sound',
      totalRows: 10,
      totalCols: 14,
    },
  });

  console.log('Created Cinemas & Auditoriums');

  // 5. Generate 3D Physical Seats for audi1
  // Rows: A, B (Classic), C, D, E, F (Prime), G, H (Balcony), J, K (Royal Recliner)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const cols = 14;

  const seatsData: any[] = [];

  rows.forEach((rowLetter, rowIndex) => {
    let category = catClassic;
    if (rowIndex >= 2 && rowIndex <= 5) category = catPrime; // C, D, E, F
    else if (rowIndex >= 6 && rowIndex <= 7) category = catBalcony; // G, H
    else if (rowIndex >= 8) category = catRoyalRecliner; // J, K

    // Calculate Z (distance from screen at z = -10)
    const coordZ = -4.5 + rowIndex * 1.5;

    // Stadium stepped elevation
    const coordY = 0.4 + Math.pow(rowIndex, 1.25) * 0.25;

    for (let c = 1; c <= cols; c++) {
      // 14 seats with subtle curve toward screen and aisles between 4/5 and 10/11
      let coordX = (c - 7.5) * 0.95;
      if (c <= 4) coordX -= 0.3; // left aisle gap
      if (c >= 11) coordX += 0.3; // right aisle gap

      // Gentle theatrical amphitheatre curve toward center
      const curveZ = coordZ + Math.pow(Math.abs(coordX) / 7.0, 2) * 0.4;

      const seatNumber = `${rowLetter}${c}`;

      seatsData.push({
        auditoriumId: audi1.id,
        seatNumber,
        row: rowLetter,
        col: c,
        categoryId: category.id,
        coordX: Number(coordX.toFixed(3)),
        coordY: Number(coordY.toFixed(3)),
        coordZ: Number(curveZ.toFixed(3)),
      });
    }
  });

  await prisma.seat.createMany({
    data: seatsData,
  });

  // Duplicate layout for audi2
  const audi2Seats = seatsData.map(s => ({
    ...s,
    auditoriumId: audi2.id,
  }));
  await prisma.seat.createMany({
    data: audi2Seats,
  });

  console.log(`Generated ${seatsData.length * 2} 3D Physical Seats with real coordinates!`);

  // 6. Blockbuster Movies
  const movie1 = await prisma.movie.create({
    data: {
      title: 'RAMAYANA',
      synopsis: 'A grand mythological cinematic masterpiece bringing the ancient Indian epic to life with state-of-the-art visual effects, monumental battle sequences, and immersive 3D world-building.',
      posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      duration: 175,
      genre: 'Mythological, Action, Epic Drama',
      language: 'Hindi',
      rating: 9.8,
      releaseDate: '2026-10-29',
      ageRating: 'UA 13+',
      director: 'Nitesh Tiwari',
      cast: 'Ranbir Kapoor, Sai Pallavi, Yash, Sunny Deol',
      isFeatured: true,
      isTrending: true,
      isNowShowing: true,
    },
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: 'Interstellar Horizons: Odyssey',
      synopsis: 'When a mysterious gravitational singularity opens near Jupiter, an international crew of astrophysicists voyages beyond the event horizon to discover humanity’s origins.',
      posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: 168,
      genre: 'Sci-Fi, Space Epic, Drama',
      language: 'English',
      rating: 9.4,
      releaseDate: '2026-10-20',
      ageRating: 'UA 13+',
      director: 'Christopher Vance',
      cast: 'Matthew Sterling, Jessica Chen, David Oyelowo, Florence Pugh',
      isFeatured: true,
      isTrending: true,
      isNowShowing: true,
    },
  });

  const movie3 = await prisma.movie.create({
    data: {
      title: 'Quantum Drift: Protocol Red',
      synopsis: 'An underground street-racing operative accidentally discovers a hyper-dimensional nitrous oxide compound that bends the speed of light and time itself.',
      posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration: 132,
      genre: 'Action, Thriller, High Octane',
      language: 'English',
      rating: 8.8,
      releaseDate: '2026-10-25',
      ageRating: 'A 18+',
      director: 'Justin Lin',
      cast: 'Paul Walker Jr., Michelle Rodriguez, Idris Elba, Gal Gadot',
      isFeatured: false,
      isTrending: true,
      isNowShowing: true,
    },
  });

  const movie4 = await prisma.movie.create({
    data: {
      title: 'Chronicles of Olympus: Divine Wrath',
      synopsis: 'Ancient myth reawakens in contemporary Athens as the elemental titans battle against modern warfare technology in an earth-shattering cinematic spectacle.',
      posterUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyblazes.mp4',
      duration: 145,
      genre: 'Fantasy, Adventure, Mythology',
      language: 'English',
      rating: 8.9,
      releaseDate: '2026-11-05',
      ageRating: 'UA 13+',
      director: 'Guillermo Del Sol',
      cast: 'Henry Cavill, Charlize Theron, Mads Mikkelsen, Tom Hardy',
      isFeatured: false,
      isTrending: false,
      isNowShowing: true,
    },
  });

  const movie5 = await prisma.movie.create({
    data: {
      title: 'Neon Ronin: Blade of Kyoto',
      synopsis: 'A cybernetically enhanced master samurai seeks retribution in the neon-drenched rainy alleys of 2088 Neo-Kyoto.',
      posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      duration: 128,
      genre: 'Neo-Noir, Action, Martial Arts',
      language: 'Japanese / English',
      rating: 9.1,
      releaseDate: '2026-11-12',
      ageRating: 'A 18+',
      director: 'Hiroyuki Sanada',
      cast: 'Hiroyuki Sanada, Rinko Kikuchi, Ken Watanabe, John Wick',
      isFeatured: false,
      isTrending: true,
      isNowShowing: false,
    },
  });

  console.log('Created Movies with authentic 1080p WebGL-friendly trailers');

  // 7. Schedule Shows for Audi 1 and Audi 2
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const showtimes = [
    { start: '10:30 AM', end: '01:15 PM', mult: 1.0 },
    { start: '02:00 PM', end: '04:45 PM', mult: 1.1 },
    { start: '06:30 PM', end: '09:15 PM', mult: 1.25 },
    { start: '10:45 PM', end: '01:30 AM', mult: 1.35 }, // Viral reel slot: 10:45 PM
  ];

  const createdShows: any[] = [];

  for (const dateStr of [today, tomorrow, dayAfter]) {
    for (let i = 0; i < showtimes.length; i++) {
      const st = showtimes[i];
      // Alternate movies between slots
      const m = i % 2 === 0 ? movie1 : movie2;
      const show1 = await prisma.show.create({
        data: {
          movieId: m.id,
          auditoriumId: audi1.id,
          date: dateStr,
          startTime: st.start,
          endTime: st.end,
          basePriceMultiplier: st.mult,
        },
      });
      createdShows.push(show1);

      const m2 = i % 2 === 0 ? movie3 : movie4;
      const show2 = await prisma.show.create({
        data: {
          movieId: m2.id,
          auditoriumId: audi2.id,
          date: dateStr,
          startTime: st.start,
          endTime: st.end,
          basePriceMultiplier: st.mult,
        },
      });
      createdShows.push(show2);
    }
  }

  console.log(`Created ${createdShows.length} scheduled shows across 3 dates`);

  // 8. Generate ShowSeats for all shows with category prices and initial booked seats
  const audi1AllSeats = await prisma.seat.findMany({
    where: { auditoriumId: audi1.id },
    include: { category: true },
  });

  // For the first show of today (Tears of Steel, 10:30 AM), let's mark a few seats booked (e.g. D4, D5, H7, H8)
  // to give realistic theatre occupancy! But keep G8, G7, F7, F8 available so user can test G8!
  const primeShow = createdShows[0];

  for (const show of createdShows) {
    const seatsToUse = show.auditoriumId === audi1.id ? audi1AllSeats : await prisma.seat.findMany({
      where: { auditoriumId: show.auditoriumId },
      include: { category: true },
    });

    const showSeatsData = seatsToUse.map(s => {
      let status = 'AVAILABLE';
      // Preset a few realistic booked seats (e.g., in row B, D, K)
      if (show.id === primeShow.id) {
        if (['B3', 'B4', 'D7', 'D8', 'E5', 'E6', 'H11', 'H12', 'K1', 'K2'].includes(s.seatNumber)) {
          status = 'BOOKED';
        }
      } else {
        if (['C4', 'C5', 'F12', 'H3'].includes(s.seatNumber)) {
          status = 'BOOKED';
        }
      }

      return {
        showId: show.id,
        seatId: s.id,
        status: status,
        price: Math.round(s.category.basePrice * show.basePriceMultiplier),
      };
    });

    await prisma.showSeat.createMany({
      data: showSeatsData,
    });
  }

  console.log('Populated all ShowSeats with dynamic pricing and realistic occupancy!');

  // 9. Add a verified sample booking and digital QR ticket for Demo User
  const demoSeat1 = audi1AllSeats.find(s => s.seatNumber === 'H11');
  const demoSeat2 = audi1AllSeats.find(s => s.seatNumber === 'H12');

  if (demoSeat1 && demoSeat2) {
    const demoBooking = await prisma.booking.create({
      data: {
        bookingRef: 'CV-2026-X892',
        userId: demoUser.id,
        showId: primeShow.id,
        totalAmount: 750,
        status: 'CONFIRMED',
        paymentId: 'pay_demo_test_verified',
      },
    });

    await prisma.bookingSeat.createMany({
      data: [
        { bookingId: demoBooking.id, seatId: demoSeat1.id, price: 375 },
        { bookingId: demoBooking.id, seatId: demoSeat2.id, price: 375 },
      ],
    });

    await prisma.payment.create({
      data: {
        bookingId: demoBooking.id,
        razorpayOrderId: 'order_test_democineverse',
        razorpayPaymentId: 'pay_test_verified_123',
        razorpaySignature: 'sig_verified_mock_checksum_9921',
        amount: 750,
        currency: 'INR',
        status: 'PAID',
        method: 'UPI / GooglePay',
      },
    });

    await prisma.ticket.create({
      data: {
        bookingId: demoBooking.id,
        ticketCode: 'TKT-9982-5510',
        qrCodeData: JSON.stringify({
          ticketCode: 'TKT-9982-5510',
          bookingRef: 'CV-2026-X892',
          movie: 'Tears of Steel: Cyber Dawn',
          seats: ['H11', 'H12'],
          cinema: 'CineVerse Grand IMAX & 4DX',
          date: today,
          showtime: '10:30 AM',
          verified: true,
        }),
      },
    });

    console.log('Created sample verified digital QR ticket CV-2026-X892');
  }

  // 10. Reviews
  await prisma.review.createMany({
    data: [
      {
        movieId: movie1.id,
        userId: demoUser.id,
        rating: 9.5,
        comment: 'Experiencing the 3D seat preview from G8 before booking was incredible. The actual theatre view was identical to the 3D model!',
      },
      {
        movieId: movie2.id,
        userId: demoUser.id,
        rating: 9.8,
        comment: 'The sound design and the massive screen visuals are unbeatable. Best cinema booking experience ever.',
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
