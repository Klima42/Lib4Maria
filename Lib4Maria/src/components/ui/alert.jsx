export function Alert({ className, children, ...props }) {
  return (
    <div className={`p-4 rounded-lg border ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AlertTitle({ className, children, ...props }) {
  return (
    <h5 className={`font-medium mb-1 ${className}`} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className, children, ...props }) {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  );
}