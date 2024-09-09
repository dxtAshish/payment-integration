import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';


const stripePromise = loadStripe('pk_test_51PvZooRpHMOyTpgDy7dRD11KElZ8Ockfeq2Kgi5FpdxWOrZJxtW51QOeo0bkx6nPQkW7IzhL6lYvPIo9suscDuRL00rtAFujdZ');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: clientSecret } = await axios.post('http://localhost:5000/create-payment-intent', {
        amount: 1099,  
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log(paymentIntent, "checking");
        alert('Payment succeeded!');
      }
    } catch (err) {
      setError('An error occurred while processing the payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.header}>Checkout</h2>
      <div style={styles.cardContainer}>
        <CardElement options={cardElementOptions} />
      </div>
      <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <div style={styles.error}>{error}</div>}
    </form>
  );
};

const cardElementOptions = {
  style: {
    base: {
      fontSize: '18px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      backgroundColor: '#f3f4f6',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #ced4da',
      marginBottom: '15px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const styles = {
  form: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    backgroundColor: '#f8f9fa',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    marginBottom: '30px',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#5469d4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '20px',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
  error: {
    marginTop: '15px',
    color: '#9e2146',
    textAlign: 'center',
  },
  cardContainer: {
    borderRadius: '10px',
    padding: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    width: '100%',
    marginBottom: '20px',
  },
};

const CheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default CheckoutPage;
