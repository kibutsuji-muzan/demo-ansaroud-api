exports.countries = async (req, res, next) => {
  try {
    const countries = require('../demodata/geo/countries.json');
    return res.status(200).json(countries);
  } catch (err) {
    console.error('GET /api/countries error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.statesByCountry = async (req, res, next) => {
  try {
    const states = require('../demodata/geo/states.json');
    const { countryId } = req.params;
    let numId = parseInt(countryId.replace(/\D/g, ''), 10) || 1;
    const start = numId % Math.max(1, states.length - 50);
    return res.status(200).json(states.slice(start, start + 50));
  } catch (err) {
    console.error('GET /api/states/:countryId error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.citiesByState = async (req, res, next) => {
  try {
    const cities = require('../demodata/geo/cities.json');
    const { stateId } = req.params;
    let numId = parseInt(stateId.replace(/\D/g, ''), 10) || 1;
    const start = numId % Math.max(1, cities.length - 50);
    return res.status(200).json(cities.slice(start, start + 50));
  } catch (err) {
    console.error('GET /api/cities/:stateId error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.countryByCode = async (req, res, next) => {
  try {
    const { countryCode } = req.params;
    const countries = require('../demodata/geo/countries.json');
    let country = countries.find(c => c.iso2 && c.iso2.toLowerCase() === countryCode.toLowerCase());
    
    if (!country) {
       country = countries[0] || { id: "1", name: "Afghanistan", iso2: "AF" };
    }
    
    return res.status(200).json(country);
  } catch (err) {
    console.error('GET /api/countries/:countryCode error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
