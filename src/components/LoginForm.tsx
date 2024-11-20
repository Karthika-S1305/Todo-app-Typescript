import React, { useState } from 'react';
import jwt from 'jsonwebtoken';

const SECRET_KEY = "KarthikaSecretKey";

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

  const handleRegisterSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!register.name || !register.email || !register.password) {
      alert('All fields are required.');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    existingUsers.push(register);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    alert('Registration successful!');
    setRegister({ name: '', email: '', password: '' });
    setIsLogin(true);
  };

  const handleLoginSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!login.email || !login.password) {
      setError('Please fill out all fields.');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = existingUsers.find(
      (user: RegisterForm) =>
        user.email === login.email && user.password === login.password
    );

    if (user) {
      const token = jwt.sign({ email: login.email }, SECRET_KEY, { expiresIn: "1h" });
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setLogin({ email: '', password: '' });
  };

  const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      jwt.verify(token, SECRET_KEY);
      return true;
    } catch (error) {
      return false;
    }
  };

  React.useEffect(() => {
    if (isTokenValid()) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div>
      {isAuthenticated ? (
        <div className="dashboard">
          <h1>Welcome to the Dashboard</h1>
          <p>You are logged in!</p>
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
    </div>
  );
};

export default App;
