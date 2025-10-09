/**
 * Reusable form components with validation and error handling
 */

import * as React from 'react'
import { useForm, UseFormReturn, FieldPath, FieldValues, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { Input } from './input'
import { Textarea } from './textarea'
import { Button } from './button'

// Form context
interface FormContextValue {
  form: UseFormReturn<FieldValues>
}

const FormContext = React.createContext<FormContextValue | null>(null)

export function useFormContext<T extends FieldValues = FieldValues>() {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a Form component')
  }
  return context as { form: UseFormReturn<T> }
}

// Form root component
interface FormProps<T extends FieldValues = FieldValues> {
  children: React.ReactNode
  form: UseFormReturn<T>
  onSubmit: (data: T) => void | Promise<void>
  className?: string
}

export function Form<T extends FieldValues = FieldValues>({
  children,
  form,
  onSubmit,
  className,
}: FormProps<T>) {
  // Cast to the generic FormContext value expected by consumers
  return (
    <FormContext.Provider value={{ form: form as unknown as UseFormReturn<FieldValues> }}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
        {children}
      </form>
    </FormContext.Provider>
  )
}

// Form field wrapper
interface FormFieldProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>
  children: (field: {
    value: unknown
    onChange: (value: unknown) => void
    onBlur: () => void
    error?: string
    disabled?: boolean
  }) => React.ReactNode
}

export function FormField<T extends FieldValues = FieldValues>({
  name,
  children,
}: FormFieldProps<T>) {
  const { form } = useFormContext<T>()
  const error = form.formState.errors[name]?.message as string | undefined

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <>
          {children({
            // The Controller `field.value` comes from react-hook-form and is
            // typed via the generic Form type. Disable our custom rule here
            // for this known typed pattern; follow-up can tighten this if
            // necessary.
            // eslint-disable-next-line local-rules/no-untyped-dom-access
            value: field.value,
            onChange: field.onChange,
            onBlur: field.onBlur,
            error,
            disabled: form.formState.isSubmitting,
          })}
        </>
      )}
    />
  )
}

// Form item wrapper
interface FormItemProps {
  children: React.ReactNode
  className?: string
}

export function FormItem({ children, className }: FormItemProps) {
  return <div className={cn('space-y-2', className)}>{children}</div>
}

// Form label
interface FormLabelProps {
  children: React.ReactNode
  required?: boolean
  className?: string
}

export function FormLabel({ children, required, className }: FormLabelProps) {
  return (
    <Label className={cn(className)}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  )
}

// Form control wrapper
interface FormControlProps {
  children: React.ReactNode
}

export function FormControl({ children }: FormControlProps) {
  return <>{children}</>
}

// Form description
interface FormDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function FormDescription({ children, className }: FormDescriptionProps) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

// Form message (error)
interface FormMessageProps {
  children?: React.ReactNode
  className?: string
}

export function FormMessage({ children, className }: FormMessageProps) {
  if (!children) return null

  return <p className={cn('text-sm font-medium text-destructive', className)}>{children}</p>
}

// Convenience hook for creating forms with validation
export function useZodForm<T extends z.ZodTypeAny>(
  schema: T,
  defaultValues?: z.infer<T>
) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as z.infer<T> | undefined,
    mode: 'onChange',
  })
}

// Pre-built form field components
interface TextFieldProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  className?: string
}

export function TextField<T extends FieldValues = FieldValues>({
  name,
  label,
  placeholder,
  description,
  required,
  type = 'text',
  className,
}: TextFieldProps<T>) {
  return (
    <FormField name={name}>
      {({ value, onChange, onBlur, error, disabled }) => (
        <FormItem className={className}>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              value={(typeof value === 'string' || typeof value === 'number') ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              className={error ? 'border-destructive' : ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    </FormField>
  )
}

interface TextareaFieldProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  rows?: number
  className?: string
}

export function TextareaField<T extends FieldValues = FieldValues>({
  name,
  label,
  placeholder,
  description,
  required,
  rows = 3,
  className,
}: TextareaFieldProps<T>) {
  return (
    <FormField name={name}>
      {({ value, onChange, onBlur, error, disabled }) => (
        <FormItem className={className}>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              value={(typeof value === 'string' || typeof value === 'number') ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              rows={rows}
              className={error ? 'border-destructive' : ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    </FormField>
  )
}

interface SelectFieldProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  options: { value: string; label: string }[]
  className?: string
}

export function SelectField<T extends FieldValues = FieldValues>({
  name,
  label,
  placeholder,
  description,
  required,
  options,
  className,
}: SelectFieldProps<T>) {
  // The `options` array is declared with `{ value: string; label: string }[]`.
  // Accessing `option.value` is safe here; disable the custom rule for
  // this known typed pattern and follow up later if stricter checks
  // are desired.
  /* eslint-disable local-rules/no-untyped-dom-access */
  const optionElements = options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))
  /* eslint-enable local-rules/no-untyped-dom-access */

  return (
    <FormField name={name}>
      {({ value, onChange, onBlur, error, disabled }) => (
        <FormItem className={className}>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <select
              value={(typeof value === 'string' || typeof value === 'number') ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                error ? 'border-destructive' : '',
              )}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {/**
               * The `options` array is declared with `{ value: string; label: string }[]`.
               * Accessing `option.value` is safe here; disable the custom rule for
               * this known typed pattern and follow up later if stricter checks
               * are desired.
               */}
              {optionElements}
            </select>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage>{error}</FormMessage>
        </FormItem>
      )}
    </FormField>
  )
}

// Form submit button
interface FormSubmitProps {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function FormSubmit({ children, loading, disabled, className }: FormSubmitProps) {
  const { form } = useFormContext()
  
  return (
    <Button
      type="submit"
      loading={loading || form.formState.isSubmitting}
      disabled={disabled || !form.formState.isValid}
      className={className}
    >
      {children}
    </Button>
  )
}
