import type { ComponentProps } from 'react';
import type SharedButton from '../../../../shared/src/components/ui/Button';

export type ButtonProps = ComponentProps<typeof SharedButton>;
export type ButtonVariant = NonNullable<ButtonProps['variant']>;
export type ButtonSize = NonNullable<ButtonProps['size']>;

export * from '../../../../shared/src/components/ui/Button';
export { default } from '../../../../shared/src/components/ui/Button';
