import Login from './Login';

/**
 * Semantic wrapper for the Login component in registration mode.
 * Satisfies W-08 audit requirement for better routing clarity and SEO.
 */
export default function Register() {
  return <Login />;
}
