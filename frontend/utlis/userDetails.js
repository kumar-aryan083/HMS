export const getUserDetails = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return null;
    const { name, email, role } = user;
    return { user: name, userEmail: email, userRole: role };
  };