import { React } from 'jimu-core'
import { SidePopper } from 'jimu-ui/advanced/setting-components'
import { Navigation } from './navigation'

interface AnchoredSidePanelProps {
  level?: 1 | 2 | 3
  label: string
  title: string
  children: React.ReactElement
}

export const AnchoredSidePanel = (props: AnchoredSidePanelProps): React.ReactElement => {
  const { level, label, title, children } = props

  const ref = React.useRef<HTMLButtonElement>(null)
  const [active, setActive] = React.useState<boolean>(false)

  return (
    <>
      <Navigation
        ref={ref}
        className='mt-2'
        level={level}
        active={active}
        title={label}
        onClick={() => { setActive(!active) }}
      />
      <SidePopper title={title} isOpen={active} position="right" toggle={() => { setActive(false) }} trigger={ref?.current} backToFocusNode={ref.current}>
        {children}
      </SidePopper>
    </>
  )
}
