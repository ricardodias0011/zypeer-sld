import { Box, Button, Flex, IconButton, Text } from '@radix-ui/themes';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../../assets/logo.png"
import { CiHome } from "react-icons/ci";
import { PiPresentationLight } from "react-icons/pi";
import { useEffect, useState } from 'react';

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
        <Flex gap={"6"} p='4' direction="column" >
          <img src={Logo} width={120} alt="logo" />
          <Flex gap={"4"} direction="column" >
            {
              [
                { link: 'dashboard', icon: <CiHome size={24} />, title: 'Seus slides' },
                { link: 'templates', icon: <PiPresentationLight size={24} />, title: 'Modelos' }
              ].map(({ icon, link, title }) => (
                <Button
                  color={currentPage === link ? "violet" : "gray"}
                  style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 8, paddingLeft: currentPage === link ? 10 : 20 }}
                  variant={currentPage === link ? 'soft' : 'ghost'}
                  onClick={_e => navigate("/app/" + link)}
                  radius='full'
                  size={'2'}>
                  {icon}
                  <Text size={'4'} weight="light">
                    {title}
                  </Text>
                </Button>
              ))
            }
          </Flex>
        </Flex>
      </Box >
      <Box
        width={"100%"}
      >
        <Flex overflow={"scroll"} className='main-app'>
          <Outlet />
        </Flex>
        <Flex
          width={"100%"}
          height={"60px"}
          align="center"
          justify="center"
          style={{ backgroundColor: "#fff" }}
          position='relative' className='box-menu-mobile'>
          <Flex gap={"4"} direction="row" >
            {
              [
                { link: 'dashboard', icon: <CiHome size={30} />, title: 'Seus slides' },
                { link: 'templates', icon: <PiPresentationLight size={30} />, title: 'Modelos' }
              ].map(({ icon, link }) => (
                <IconButton
                  color={currentPage === link ? "violet" : "gray"}
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