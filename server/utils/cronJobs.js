import axios from 'axios';

export const updatePredictions = async () => {
  try {
    console.log('Running scheduled prediction update...');
    await axios.post(`${process.env.ML_SERVICE_URL}/retrain`);
    console.log('Prediction models updated successfully');
  } catch (error) {
    console.error('Error updating predictions:', error.message);
  }
};
