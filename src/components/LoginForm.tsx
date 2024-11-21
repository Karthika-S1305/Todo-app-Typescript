import axios from 'axios';
import React, { useState } from 'react';


interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

interface LoginForm {
  email: string;
  password: string;
}

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [isOtpScreen, setIsOtpScreen] = useState(false); 
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const [register, setRegister] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
  });

  const [login, setLogin] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin({
      ...login,
      [e.target.id]: e.target.value,
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegister({
      ...register,
      [e.target.id]: e.target.value,
    });
  };

  const handleRegisterSubmit = async(e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!register.name || !register.email || !register.password) {
      alert('All fields are required.');
      return;
    }

    try{
      const response = await axios.post('http://localhost:8005/api/register', register)
      if(response.data.success){
        alert("Regitration successful!")
        setRegister({name: '', email:'', password: ''});
        setIsLogin(true);
      } else{
        alert(response.data.message || 'Registration failed');
      }
    }catch(error){
        console.error(error);
        alert('An error occured during registration');
        
    }
  }
  const fetchProtectedData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
  
      const response = await axios.get('http://localhost:8005/api/protected-route', {
        headers: {
          Authorization: token,
        },
      });
  
      console.log(response.data); 
      setIsAuthenticated(true);
    } catch (error:any) {
      console.error('Error accessing protected route:', error.response?.data || error.message);
    }
  };

  const handleLoginSubmit = async(e: React.SyntheticEvent) => {
    e.preventDefault();

    const { email, password } = login;
    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    try{
      const response = await axios.post('http://localhost:8005/api/login',{
        email, 
        password,
      },{
        headers: {
          'Content-Type' : 'application/json',
        },
      });
      if (response.data.accessToken) {
        localStorage.setItem('token', `Bearer ${response.data.accessToken}`); 
        
        fetchProtectedData(); 
      } else {
        alert('Login failed: No token received.');
      }
  
    } catch (error:any) {
      alert('Login failed: ' + (error.response?.data?.message || 'Please try again.'));
      console.error('Login error:', error); 
    }
  };

  const handleForgotPassword = async(e: React.SyntheticEvent)=>{
    e.preventDefault();

    try{
      const response = await axios.post('http://localhost:8005/api/forgot-password', {email: login.email})
      if(response.data.sucess){
        alert('OTP send successfully!');
        setIsForgotPassword(false);
        setIsOtpScreen(true);
      }else{
        alert(response.data.message || 'Error sending OTP.');
      }
    }catch(error:any){
        console.error('Forgot password error:', error);
        alert('Error occured');
    }
  }

  const handleResetPasswordSubmit = async (e: React.SyntheticEvent) => {
  e.preventDefault();

  try {
    const response = await axios.post('http://localhost:8005/api/reset-password', {
      email: login.email,
      otp,
      newPassword,
    });
    if (response.data.success) {
      alert('Password reset successful!');
      setIsResetPassword(false);
      setIsLogin(true);
    } else {
      alert('Password reset failed. Please try again.');
    }
  } catch (error) {
    console.error('Password reset error:', error);
    alert('Error resetting password.');
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setLogin({ email: '', password: '' });
  }
    const handleOtpVerification = async(e: React.SyntheticEvent) => {
        e.preventDefault();

        try{
          const response = await axios.post('http://localhost:8005/api/verify-otp', { email: login, otp })
          if(response.data.success){
            alert('OTP verified successfully!');
            setIsOtpScreen(false);
            setIsResetPassword(true);
          }else{
            alert('Invalid OTP. Please try again');
          }
        }catch(error){
          console.error('OTP verification failed');
          alert('Error verifying otp');
          
        }
    }

    const showForgot = ()=>{
      setIsLogin(false);
      setIsForgotPassword(true);
      setIsOtpScreen(false);
      
    }

  return (
    <div>
      {isAuthenticated ? (
        <div className="dashboard">
          <h1>Welcome to the Dashboard</h1>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${isLogin ? 'active' : ''}`}
                type="button"
                role="tab"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${!isLogin ? 'active' : ''}`}
                type="button"
                role="tab"
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </li>
          </ul>

          <div>
            {isLogin ? (
              <form onSubmit={handleLoginSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={login.email}
                    onChange={handleLoginChange}
                    aria-describedby="emailHelp"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={login.password}
                    onChange={handleLoginChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
                <p>
                  <a href="#" onClick={showForgot}>Forgot Password?</a>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={register.name}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={register.email}
                    onChange={handleRegisterChange}
                    aria-describedby="emailHelp"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={register.password}
                    onChange={handleRegisterChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {isForgotPassword && (
        <form onSubmit={handleForgotPassword}>
          <div className='mb-3'>
              <label htmlFor='email' className='form-label'>Enter Email</label>
              <input
              type='email'
              className='form-control'
              id='email'
              value={login.email}
              onChange={handleLoginChange}/>
          </div>
          <button type='submit' className='btn btn-primary'>Send OTP</button>
          <button type='button' className='btn btn-link' onClick={()=> setIsLogin(true)}>Back to login</button>
        </form>
      )}

{isOtpScreen && (
  <form onSubmit={handleOtpVerification}>
    <div className="mb-3">
      <label htmlFor="otp" className="form-label">Enter OTP</label>
      <input
        type="text"
        className="form-control"
        id="otp"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
    </div>
    <button type="submit" className="btn btn-primary">Verify OTP</button>
    <button type="button" className="btn btn-link" onClick={() => setIsLogin(true)}>Back to Login</button>
  </form>
)}

{isResetPassword && (
  <form onSubmit={handleResetPasswordSubmit}>
    <div className="mb-3">
      <label htmlFor="newPassword" className="form-label">New Password</label>
      <input
        type="password"
        className="form-control"
        id="newPassword"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
    </div>
    <button type="submit" className="btn btn-primary">Reset Password</button>
    <button type="button" className="btn btn-link" onClick={() => setIsLogin(true)}>Back to Login</button>
  </form>
)}


    </div>
  );
};


export default App;
