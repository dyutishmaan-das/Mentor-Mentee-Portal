export function authorize(allowedRoles) {
    // Handle both array and spread parameters
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        // Debug logging
        console.log('=== AUTHORIZE MIDDLEWARE DEBUG ===');
        console.log('User Role:', req.user.role);
        console.log('Allowed Roles:', roles);
        console.log('Role Check Result:', roles.includes(req.user.role));
        console.log('User ID:', req.user._id);
        console.log('Request Path:', req.path);
        console.log('==================================');

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
        }

        next();
    };
}