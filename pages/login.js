import { useRouter } from 'next/router'
import Auth from '../components/Auth'

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return <Auth onSuccess={handleSuccess} />
}
