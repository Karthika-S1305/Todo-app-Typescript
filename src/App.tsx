import React from 'react';
import LoginForm from './components/LoginForm';
import { Provider } from 'react-redux';
import store from '../src/redux/store'

const App: React.FC = () =>{


  // const [count, setCount] = useState(0);
  // const inputRef = useRef<number>(0);

  // useEffect(()=>{
  //   const totalCount = localStorage.getItem('count');
  //   if(totalCount){
  //     setCount(JSON.parse(totalCount));
  //   }
  // }, [])

  // const Increment = (e: React.FormEvent) =>{
  //   e.preventDefault();
  //   inputRef.current++;
  //   setCount((count)=> count+1)
  // }

  // const Decrement = () =>{
  //   inputRef.current++;
  //   setCount((count) => count-1)
  // }

 

  return (
    <Provider store={store}>
    <div className='container p-3 mb-2 bg-light text-dark' style={{width: '400px', alignItems: 'center', padding: '20px', marginTop: '100px'}}>
 
    <LoginForm/>
  </div>
  </Provider>
  );
}

export default App;
