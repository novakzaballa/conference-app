import React, { useState } from 'react';
import axios from 'axios';

const CallComponent = () => {
  const [numbers, setNumbers] = useState([]);
  const [conferenceName, setConferenceName] = useState('MyConferenceRoom');

  const handleAddNumber = () => {
    setNumbers([...numbers, '']);
  };

  const handleNumberChange = (index, event) => {
    const newNumbers = [...numbers];
    newNumbers[index] = event.target.value;
    setNumbers(newNumbers);
  };

  const handleMakeCalls = () => {
    axios.post('https://5ab6-181-188-171-226.ngrok-free.app/make-calls', { numbers })
      .then(response => {
        console.log(response.data.message);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleCreateToken = () => {
    axios.get('http://localhost:3001/token')
      .then(response => {
        console.log(response.data.message);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div>
      <h2>Call Multiple Numbers</h2>
      {numbers.map((number, index) => (
        <div key={index}>
          <input
            type="text"
            value={number}
            onChange={(event) => handleNumberChange(index, event)}
            placeholder="Enter phone number"
          />
        </div>
      ))}
      <button onClick={handleAddNumber}>Add Number</button>
      <button onClick={handleMakeCalls}>Make Calls</button>
      <button onClick={handleCreateToken}>Init client</button>

    </div>
  );
};

export default CallComponent;
