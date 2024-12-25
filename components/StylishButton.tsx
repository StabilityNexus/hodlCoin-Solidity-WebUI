export function StylishButton({
  children,
  buttonCall,
}: {
  children: React.ReactNode
  buttonCall: () => void
}) {
  return (
    <button
      onClick={buttonCall}
      className='w-full uppercase relative h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 group'
    >
      <span className='w-0 h-full rounded bg-green-100 absolute top-0 left-0 ease-out duration-500 transition-all group-hover:w-full group-hover:h-full -z-1'></span>
      <span className='w-full transition-colors duration-300 ease-in-out z-10'>
        {children}
      </span>
    </button>
  )
}
