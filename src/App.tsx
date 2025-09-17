import './App.css'
import "@radix-ui/themes/styles.css";
import { Theme } from '@radix-ui/themes';
import { AuthProvider } from './context/auth';
import { BrowserRouter } from 'react-router-dom';
import "./assets/styles/index.css"
import Routes from './routes';
import moment from 'moment';
moment.locale('pt-br');

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Theme hasBackground={false}>
          <Routes />
        </Theme>
      </AuthProvider>
    </BrowserRouter>

  )
}

export default App
