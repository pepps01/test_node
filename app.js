const express = require('express')
const app = express()
const axios = require('axios'); // For making HTTP requests
const port = process.env.PORT || 3000
 
var requestIp = require('request-ip');

var get_ip = require('ipware')().get_ip;
app.get('/', (req, res) => {
  res.json({
    message: 'Hello, yes!',
  })
})
 
app.get('/api/hello', async (req, res) => {
    try {
        const visitorName = req.query.visitor_name || 'Guest';
        var clientIp = extractIpAddress(requestIp.getClientIp(req))

        const { location, temperature } = await fetchData(clientIp);

        const response = {
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`
          };
      
          res.json(response);
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
})


function extractIpAddress(ipAddress) {
    // If IP is IPv6 format, extract IPv4 part
    if (ipAddress.substr(0, 7) === '::ffff:') {
      return ipAddress.substr(7);
    }
    return ipAddress;
  }
  

async function fetchData(ipAddress) {
    try {
        console.log("IP ADDRESS", ipAddress)
        const locationResponse = await axios.get(`https://api.ip2location.io/?key=0879B8DA7DDD15CD41D5EAC185448C21&ip=${ipAddress}`);
        const locationData = locationResponse.data;
        const city = locationData['city_name'];
        
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=0c3133342a2344fd6d7696da0bb6f4b9`);
        const temperature = weatherResponse.data.main.temp;
  
      return { location: city, temperature };

    } catch (error) {
      throw new Error('Failed to fetch location or weather data');
    }
  }

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})