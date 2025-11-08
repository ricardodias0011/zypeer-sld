import { Navigate, useRoutes } from "react-router-dom"
import Layout from "../components/layout"
import { LoginRequiredPage } from "../pages/auth"
import HomePage from "../pages/home"
import SlidePage from "../pages/slides"
import FullApresentation from "../pages/slides/full"
import TemplatesPage from "../pages/templates"
import UserStorage from "../services/storage/auth"

const Routes = () => {
  const account = UserStorage.getTokenStorage()
  return useRoutes(!!account ? [
    {
      path: '/',
      Component: () => <Navigate to={'/app/dashboard'} />,
    },
    {
      path: '/*',
      Component: () => <Navigate to={'/app/dashboard'} />,
    },
    {
      path: '/app',
      Component: Layout,
      children: [
        {
          path: '/app/dashboard',
          Component: HomePage
        },
        {
          path: '/app/templates',
          Component: TemplatesPage
        }
      ]
    },
    {
      path: '/docs/show/:id',
      Component: FullApresentation
    },
    {
      path: '/docs/:id',
      Component: SlidePage
    }
  ] : [
    {
      path: '/',
      Component: () => <Navigate to={'/auth/required'} />,
    },
    {
      path: '/*',
      Component: () => <Navigate to={'/auth/required'} />,
    },
    {
      path: '/auth/required',
      Component: LoginRequiredPage
    },
    {
      path: '/docs/show/:id',
      Component: FullApresentation
    }
  ])
}

export default Routes;