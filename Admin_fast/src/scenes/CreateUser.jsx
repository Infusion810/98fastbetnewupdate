// import React from "react";
// import { Box, Button, TextField, useTheme } from "@mui/material";
// import { tokens } from "../theme";
// import { Formik } from "formik";
// import * as yup from "yup";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import Header from "../components/Header";
// import axios from "axios";
// // Corrected initialValues object
// const initialValues = {
//   contact: "",
//   balance: "", // Changed lastName to balance
//   email: "",
//   password: "",
// };

// const phoneRegExp =
//   /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

// const userSchema = yup.object().shape({
//   firstName: yup.string().required("First Name is required"),
//   balance: yup.string().required("Balance is required"), // Changed validation to balance
//   email: yup.string().email("Invalid email").required("Email is required"),
//   contact: yup
//     .string()
//     .matches(phoneRegExp, "Phone Number is not Valid")
//     .required("Contact is required"),
//   password: yup.string().required("Password is required"),
// });

// function Form() {
//   const isNonMobile = useMediaQuery("(max-width: 600px)");
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const handleFormSubmit = async (values, { setSubmitting }) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_URL}/api/admin/signup`, 
//         {
//           username: values.contact, // Assuming contact is username
//           email: values.email,
//           password: values.password,
//           balance: parseFloat(values.balance), // Convert balance to number
//         }
//       );
  
//       alert("Signup successful! User created with balance: ₹" + response.data.user.balance);
//     } catch (error) {
//       console.error("Signup failed:", error.response?.data?.message || error.message);
//       alert(error.response?.data?.message || "Something went wrong!");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Box m="0.5rem 1rem">
//       <Header title="CREATE NEW USER" subtitle="Create New User Profile" />
//       <Formik
//         initialValues={initialValues}
//         onSubmit={handleFormSubmit}
//         validationSchema={userSchema}
//       >
//         {({
//           values,
//           errors,
//           touched,
//           handleBlur,
//           handleChange,
//           handleSubmit,
//         }) => {
//           return (
//             <form onSubmit={handleSubmit}>
//               <Box
//                 display="grid"
//                 gap="1rem"
//                 spacing={{ xs: 2, md: 3 }}
//                 gridTemplateColumns={isNonMobile ? undefined : "repeat(12, 1fr)"}
//                 sx={{
//                   "& > div": {
//                     // gridColumn: isNonMobile ? "span 12" : "span 12",
//                   },
//                 }}
//               >
//                   <TextField
//                   type="text"
//                   variant="filled"
//                   fullWidth
//                   label="Contact Number"
//                   name="contact"
//                   value={values.contact}
//                   onBlur={handleBlur}
//                   onChange={handleChange}
//                   error={touched.contact && Boolean(errors.contact)}
//                   helperText={touched.contact && errors.contact}
//                   sx={{ gridColumn: isNonMobile ? undefined : "span 12" }}
//                   InputLabelProps={{
//                     style: { color: colors.grey[100] },
//                   }}
//                 />
//                 <TextField
//                   type="text"
//                   variant="filled"
//                   fullWidth
//                   label="Balance"
//                   name="balance" // Changed field name to balance
//                   value={values.balance}
//                   onBlur={handleBlur}
//                   onChange={handleChange}
//                   error={touched.balance && Boolean(errors.balance)} // Adjusted validation error for balance
//                   helperText={touched.balance && errors.balance} // Adjusted helper text for balance
//                   sx={{ gridColumn: "span 6" }}
//                   InputLabelProps={{
//                     style: { color: colors.grey[100] },
//                   }}
//                 />
//                 <TextField
//                   type="text"
//                   variant="filled"
//                   fullWidth
//                   label="Email"
//                   name="email"
//                   value={values.email}
//                   onBlur={handleBlur}
//                   onChange={handleChange}
//                   error={touched.email && Boolean(errors.email)}
//                   helperText={touched.email && errors.email}
//                   sx={{ gridColumn: isNonMobile ? undefined : "span 12" }}
//                   InputLabelProps={{
//                     style: { color: colors.grey[100] },
//                   }}
//                 />
          
//                 <TextField
//                   type="password"
//                   variant="filled"
//                   fullWidth
//                   label="Password"
//                   name="password"
//                   value={values.password}
//                   onBlur={handleBlur}
//                   onChange={handleChange}
//                   error={touched.password && Boolean(errors.password)}
//                   helperText={touched.password && errors.password}
//                   sx={{ gridColumn: isNonMobile ? undefined : "span 12" }}
//                   InputLabelProps={{
//                     style: { color: colors.grey[100] },
//                   }}
//                 />
//               </Box>
//               <Box display="flex" justifyContent="end" mt="0.4rem">
//                 <Button type="submit" color="secondary" variant="contained">
//                   Create New User
//                 </Button>
//               </Box>
//             </form>
//           );
//         }}
//       </Formik>
//     </Box>
//   );
// }

// export default Form;
import React from "react";
import { Box, Button, TextField, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";
import axios from "axios";

// Corrected initialValues object
const initialValues = {
  contact: "",
  balance: "",
  email: "",
  password: "",
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

// Corrected validation schema
const userSchema = yup.object().shape({
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("Contact is required"),
  balance: yup.string().required("Balance is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

function Form() {
  const isNonMobile = useMediaQuery("(max-width: 600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleFormSubmit = async (values, { setSubmitting }) => {
    console.log("Submitting form with values:", values);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/signup`,
        {
          username: values.contact,
          email: values.email,
          password: values.password,
          balance: parseFloat(values.balance),
        }
      );

      alert("Signup successful! User created with balance: ₹" + response.data.user.balance);
    } catch (error) {
      console.error("Signup failed:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box m="0.5rem 1rem">
      <Header title="CREATE NEW USER" subtitle="Create New User Profile" />
      <Formik
        initialValues={initialValues}
        validationSchema={userSchema}
        onSubmit={handleFormSubmit} // Corrected function usage
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="1rem"
              spacing={{ xs: 2, md: 3 }}
              gridTemplateColumns={isNonMobile ? undefined : "repeat(12, 1fr)"}
            >
              <TextField
                type="text"
                variant="filled"
                fullWidth
                label="Contact Number"
                name="contact"
                value={values.contact}
                onBlur={handleBlur}
                onChange={handleChange}
                error={touched.contact && Boolean(errors.contact)}
                helperText={touched.contact && errors.contact}
                sx={{ gridColumn: isNonMobile ? undefined : "span 12" }}
                InputLabelProps={{
                  style: { color: colors.grey[100] },
                }}
              />
              <TextField
                type="text"
                variant="filled"
                fullWidth
                label="Balance"
                name="balance"
                value={values.balance}
                onBlur={handleBlur}
                onChange={handleChange}
                error={touched.balance && Boolean(errors.balance)}
                helperText={touched.balance && errors.balance}
                sx={{ gridColumn: "span 6" }}
                InputLabelProps={{
                  style: { color: colors.grey[100] },
                }}
              />
              <TextField
                type="text"
                variant="filled"
                fullWidth
                label="Email"
                name="email"
                value={values.email}
                onBlur={handleBlur}
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: isNonMobile ? undefined : "span 12" }}
                InputLabelProps={{
                  style: { color: colors.grey[100] },
                }}
              />
              <TextField
                type="password"
                variant="filled"
                fullWidth
                label="Password"
                name="password"
                value={values.password}
                onBlur={handleBlur}
                onChange={handleChange}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: isNonMobile ? undefined : "span 12" }}
                InputLabelProps={{
                  style: { color: colors.grey[100] },
                }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="0.4rem">
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
}

export default Form;
