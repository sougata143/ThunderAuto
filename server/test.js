const { resolvers } = require('./src/graphql/resolvers/admin.resolver');
const mongoose = require('mongoose');
const { Car } = require('./src/models/Car');

async function testCreateCar() {
  console.log('Starting test...');
  
  // Connect to MongoDB
  await mongoose.connect('mongodb://localhost:27017/thunderauto_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'ADMIN'
  };

  const mockContext = { user: mockUser };

  const baseCarInput = {
    make: 'Toyota',
    carModel: 'Camry',
    year: 2023,
    price: 25000,
    engineType: 'GASOLINE',
    transmission: 'AUTOMATIC'
  };

  try {
    console.log('Attempting to create car...');
    const result = await resolvers.AdminMutation.createCar(
      null, 
      { input: baseCarInput }, 
      mockContext
    );

    console.log('Car created successfully:', result);
    
    // Validate result
    if (!result) throw new Error('No car created');
    if (result.make !== 'Toyota') throw new Error('Incorrect make');
    if (result.carModel !== 'Camry') throw new Error('Incorrect model');
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

testCreateCar();
