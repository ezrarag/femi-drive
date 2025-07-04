import type { SVGProps } from "react"

function Car(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="17" height="12" x="2" y="6" rx="2" />
      <path d="M6 18L6 22" />
      <path d="M18 18L18 22" />
      <circle cx="6" cy="14" r="2" />
      <circle cx="18" cy="14" r="2" />
    </svg>
  )
}

export default Car
