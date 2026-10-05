// Gujarat district names, including Vav-Tharad, plus common town names.
const districts = [
  'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad',
  'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath',
  'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada',
  'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat',
  'Surendranagar', 'Tapi', 'Vadodara', 'Valsad', 'Vav-Tharad',
];

const towns = [
  'Ankleshwar', 'Bhuj', 'Deesa', 'Dwarka', 'Godhra', 'Himmatnagar', 'Lunawada',
  'Modasa', 'Nadiad', 'Palanpur', 'Rajpipla', 'Tharad', 'Vapi', 'Veraval',
];

export const gujaratLocations = [...new Set([...districts, ...towns])].map(name => `${name}, Gujarat`);
