import { Theme } from '@radix-ui/themes';
import "@radix-ui/themes/styles.css";
import moment from 'moment';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import "./assets/styles/index.css";
import { AuthProvider } from './context/auth';
import { SlideProvider } from './context/slides';
import Routes from './routes';
moment.locale('pt-br');

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Theme hasBackground={false} style={{ overflow: 'hidden' }}>
          <SlideProvider>
            <Routes />
          </SlideProvider>
        </Theme>
      </AuthProvider>
    </BrowserRouter>

  )
}

export default App
