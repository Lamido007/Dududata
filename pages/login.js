import Auth from '../components/Auth'

export default function LoginPage() {
  return <Auth onSuccess={() => window.location.href = '/dashboard'} />
    }
