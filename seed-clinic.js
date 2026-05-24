const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function seedClinic() {
  console.log('🌱 Starting Clinic Data Seeding...');

  try {
    // 1. Register Shop Owner
    console.log('1. Registering Clinic Owner...');
    const ownerData = {
      name: 'Dr. Sarah Connor',
      phone: '9524908550',
      email: 'sarah.clinic@example.com',
      password: 'Password123!',
      role: 'SHOP_OWNER'
    };
    
    let token;
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, ownerData);
      token = regRes.data.accessToken;
    } catch (e) {
      if (e.response?.status === 400 && e.response?.data?.message?.includes('already registered')) {
        console.log('   User already exists, logging in instead...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
          phone: ownerData.phone,
          password: ownerData.password
        });
        token = loginRes.data.accessToken;
      } else {
        throw e;
      }
    }
    
    console.log('   ✅ Owner authenticated');
    
    const api = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Create Shop (Clinic)
    console.log('2. Creating City Care Clinic...');
    let shopId;
    const myShops = await api.get('/owner/shops');
    
    if (myShops.data.length > 0) {
      shopId = myShops.data[0].id;
      console.log(`   Clinic already exists with ID: ${shopId}`);
    } else {
      const shopRes = await api.post('/owner/shops', {
        name: 'City Care Clinic',
        address: '123 Health Ave, Medical District',
        category: 'CLINIC',
        latitude: 22.5726,
        longitude: 88.3639,
        operatingHours: {
          'MONDAY': { open: '09:00', close: '17:00' },
          'TUESDAY': { open: '09:00', close: '17:00' },
          'WEDNESDAY': { open: '09:00', close: '17:00' },
          'THURSDAY': { open: '09:00', close: '17:00' },
          'FRIDAY': { open: '09:00', close: '17:00' },
          'SATURDAY': { open: '10:00', close: '14:00' },
          'SUNDAY': null
        }
      });
      shopId = shopRes.data.id;
      console.log(`   ✅ Clinic created: ${shopId}`);
    }

    // 3. Add Services
    console.log('3. Adding Clinic Services...');
    const services = [
      { name: 'General Consultation', description: 'Basic checkup and diagnosis', price: 50.0, durationMinutes: 20 },
      { name: 'Vaccination', description: 'Standard immunizations', price: 30.0, durationMinutes: 10 },
      { name: 'Blood Test Sample', description: 'Sample collection for lab tests', price: 20.0, durationMinutes: 15 },
      { name: 'Specialist Referral', description: 'Detailed review and referral', price: 80.0, durationMinutes: 30 }
    ];

    const currentServices = await api.get(`/shops/public/${shopId}/services`);
    if (currentServices.data.length === 0) {
      for (const svc of services) {
        await api.post(`/owner/shops/${shopId}/services`, svc);
        console.log(`   Added service: ${svc.name}`);
      }
    } else {
      console.log('   Services already populated');
    }

    // 4. Add Service Providers (Doctors)
    console.log('4. Adding Doctors...');
    const providers = [
      { name: 'Dr. John Smith', role: 'General Physician', available: true },
      { name: 'Nurse Emily', role: 'Head Nurse', available: true }
    ];

    const currentProviders = await api.get(`/shops/${shopId}/providers`);
    if (currentProviders.data.length === 0) {
      for (const prov of providers) {
        await api.post(`/shops/${shopId}/providers`, prov);
        console.log(`   Added provider: ${prov.name}`);
      }
    } else {
      console.log('   Doctors already populated');
    }

    // 5. Post an Announcement
    console.log('5. Posting Announcement...');
    const currentAnnouncements = await api.get(`/shops/public/${shopId}/announcements`);
    if (currentAnnouncements.data.length === 0) {
      await api.post(`/owner/shops/${shopId}/announcements`, {
        title: 'Flu Season Notice',
        message: 'Flu shots are now available. Walk-ins welcome!',
        type: 'INFO'
      });
      console.log('   ✅ Announcement posted');
    }

    console.log('\n🎉 Seeding Complete! 🎉');
    console.log('You can now log into the Dashboard with:');
    console.log('Phone: +15550001234');
    console.log('Password: Password123!');

  } catch (error) {
    console.error('❌ Error during seeding:');
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

seedClinic();
