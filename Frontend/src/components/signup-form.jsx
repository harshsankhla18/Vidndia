import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import signupimage from "../assets/signupimage.png"
import { Link } from "react-router-dom"
import { useState } from "react"
export function SignupForm({
  className,
  ...props
}) {
        const [email, setemail] = useState("");
        const [username, setusername] = useState("");
        const [fullname, setfullname] = useState("");
        const [password, setPassword] = useState("");
        const handleRegister = async (e) => {
            e.preventDefault()
  
            try {
              const response = await api.post("/users/register", {
                email,
                username,
                fullName,
                password
              })
  
              console.log(response.data)
            } catch (error) {
              console.log(error.response?.data || error.message)
            }
        }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleRegister} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Enter your email below to create your account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" required />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Username</FieldLabel>
                <Input id="username" type="text" placeholder="username" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="full-name" type="text" placeholder="e.g. Harsh Sankhla" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="file">Avatar</FieldLabel>
                <Input id="full-name" type="file" placeholder="Please Upload a Profile Image" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="file">Cover Image</FieldLabel>
                <Input id="full-name" type="file" placeholder="Please Upload a Profile Image"/>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirm-password" type="password" required />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">Create Account</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              </FieldSeparator>
              <FieldDescription className="text-center">
                Already have an account? <Link to="/">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src={signupimage}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
