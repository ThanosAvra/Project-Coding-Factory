import axios from 'axios';

console.log('Ξεκινάει η κλήση...');

axios.post('http://localhost:8080/api/users/register', {
  username: 'thanos',
  password: '123456'
})
.then(res => {
  console.log('Απάντηση:', res.data);
})
.catch(err => {
  console.error('Σφάλμα:', err.response?.data || err.message);
})
.finally(() => {
  console.log('Τέλος εκτέλεσης');
});