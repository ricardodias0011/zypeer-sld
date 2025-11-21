import { Theme } from '@radix-ui/themes';
import "@radix-ui/themes/styles.css";
import moment from 'moment';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import "./assets/styles/index.css";
import { AuthProvider } from './context/auth';
import Routes from './routes';
moment.locale('pt-br');

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Theme hasBackground={false} style={{ overflow: 'hidden' }}>
          <Routes />
        </Theme>
      </AuthProvider>
    </BrowserRouter>

  )
}

export default App
