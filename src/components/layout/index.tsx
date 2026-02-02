import { Box, Flex, IconButton } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { AiFillHome } from 'react-icons/ai';
import { HiMiniPresentationChartBar } from "react-icons/hi2";
import { PiPresentationChart } from 'react-icons/pi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../../assets/micro-logo.svg";
import { Button } from '../v2/ui/button';

const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    const regex = /^\/app\/([^\/]+)/;
    const match = pathname.match(regex);
    console.log(match?.[1])
    if (match?.[1]) {
      setCurrentPage(match[1] ?? "")
    }

  }, [pathname])


  return (
    <Flex direction="row" width="100vw">
      <Box width={"280px"} height={"100vh"} style={{ backgroundColor: "#fff" }} position='relative' className='box-menu'>
        <Flex gap={"6"} p='4' direction="column" className='w-full'>
          <div className='flex flex-row gap-2 items-center'>
            <img src={Logo} width={150} alt="logo" />
          </div>
          <Flex gap={"2"} direction="column" className='w-full'>
            {
              [
                { link: 'dashboard', icon: <PiPresentationChart size={20} />, title: 'Seus slides' },
                // { link: 'templates', icon: <PiPresentation size={20} />, title: 'Modelos' }
              ].map(({ icon, link, title }) => (
                <Button
                  style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 8, paddingLeft: 10 }}
                  variant={currentPage === link ? 'default' : 'ghost'}
                  onClick={_e => navigate("/app/" + link)}
                  className='p-2 py-0'
                >
                  {icon}
                  <span className='text-md'>
                    {title}
                  </span>
                </Button>
              ))
            }
          </Flex>
        </Flex>
      </Box >
      <Box
        width={"100%"}
        className='bg-gray-100'
      >
        <Flex overflow={"scroll"} className='main-app'>
          <Outlet />
        </Flex>
        <Flex
          width={"100%"}
          height={"60px"}
          align="center"
          justify="center"
          position='relative' className='box-menu-mobile'>
          <Flex gap={"4"} direction="row" >
            {
              [
                { link: 'dashboard', icon: <AiFillHome size={30} />, title: 'Seus slides' },
                { link: 'templates', icon: <HiMiniPresentationChartBar size={30} />, title: 'Modelos' }
              ].map(({ icon, link }) => (
                <IconButton
                  color={currentPage === link ? "cyan" : "gray"}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                  variant={'ghost'}
                  onClick={_e => navigate("/app/" + link)}
                  radius='full'
                  size={'2'}>
                  {icon}
                </IconButton>
              ))
            }
          </Flex>
        </Flex>
      </Box>

    </Flex >
  );
};

export default Layout;