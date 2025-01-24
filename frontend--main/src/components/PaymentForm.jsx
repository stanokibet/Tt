import React, { useState, useEffect } from 'react';

const PaymentForm = ({ studentId, onPaymentSucces}) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [termId, setTermId] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch(
          `https://49eca945-a85d-4041-8329-c8ccc69e464c-00-37km72cvzyu68.janeway.replit.dev:5000/terms`
        );
        if (!response.ok) throw new Error('Failed to fetch terms.');
        const data = await response.json();
        setTerms(data);
        const activeTerm = data.find((term) => term.is_active);
        if (activeTerm) setTermId(activeTerm.id);
      } catch (err) {
        setError(err.message || 'Failed to load terms.');
      }
    };

    fetchTerms();
  }, []);

  const handlePayment = async () => {
    setError('');
    setSuccess('');

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    if (!termId) {
      setError('Please select an active term.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://49eca945-a85d-4041-8329-c8ccc69e464c-00-37km72cvzyu68.janeway.replit.dev:5000/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          amount: parseFloat(amount),
          method,
          description,
          date,
          term_id: termId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment.');
      }

      setSuccess('Payment successfully added!');
      onPaymentSuccess();
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to add payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Make Payment</h4>
      <div>
        <label htmlFor="amount">Amount:</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>
      <div>
        <label htmlFor="method">Method:</label>
        <select
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="mpesa">In-Kind</option>
          <option value="paybill">Paybill</option>
        </select>
      </div>
      <div>
        <label htmlFor="date">Date:</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>
      <div>
        <label htmlFor="term">Term:</label>
        <select
          id="term"
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
        >
          <option value="">Select Term</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Add Payment'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default PaymentForm;



