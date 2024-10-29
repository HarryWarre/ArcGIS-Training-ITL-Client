import { React, classNames } from 'jimu-core'
import { SettingOutlined } from 'jimu-icons/outlined/application/setting'
import { Button } from 'jimu-ui'

export interface NavigationProps {
  level?: 1 | 2 | 3
  title: string
  active?: boolean
  onClick: () => void
  className?: string
}

export const Navigation = React.forwardRef((props: NavigationProps, ref: React.RefObject<HTMLButtonElement>): React.ReactElement => {
  const { level = 3, title, active, onClick, className } = props

  return (
    <div
    className={classNames(
      className,
      'navigation w-100 d-flex align-items-center justify-content-between',
        `setting-text-level-${level}`
    )}
    >
      <span className='title'>{title}</span>
      <Button ref={ref} aria-label={title} size='sm' type='tertiary' active={active} icon onClick={onClick}>
        <SettingOutlined />
      </Button>
    </div>
  )
})
