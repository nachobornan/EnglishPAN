export interface WhitelistedUser {
    email: string;
    name: string;
}

export const ALLOWED_USERS: WhitelistedUser[] = [
    { email: 'nachobornan@gmail.com', name: 'Nacho' },
    { email: 'juarez.mirta@gmail.com', name: 'Mirta' },
    { email: 'juanxx@gmail.com', name: 'Juan' }, // Whitelisted name mapped as requested
    { email: 'nicobornanjuega@gmail.com', name: 'Nico' },
    { email: 'nicolas.bornancini@gmail.com', name: 'Nicolás' }
];

// Map emails array for compatibility with App.tsx gatekeeper
export const ALLOWED_EMAILS = ALLOWED_USERS.map(user => user.email.toLowerCase());

/**
 * Returns the mapped name of a whitelisted user, or their email if not found
 */
export function getUserName(email: string | undefined | null): string {
    if (!email) return 'Invitado';
    const found = ALLOWED_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
    return found ? found.name : email;
}
