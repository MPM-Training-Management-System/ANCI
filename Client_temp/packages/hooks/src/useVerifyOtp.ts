import { useState } from "react";
import { AuthApi } from "@repo/api";

export interface VerifyOtpFormValues{
    email: string;
    otpCode: string;
}

export function useVerifyOtp(
    authApi: AuthApi
){
    const [isLoading, setIsLoading] =  useState(false);
    const [ error, setError] = useState<string | null>(null);
    const [success, setSucess] = useState(false);

    const verifyOTp = async (
        values: VerifyOtpFormValues
    ) => {
        try{
            setIsLoading(true);
            setError(null);
            setSucess(true);

            const response = await authApi.verifyOtp({
                email: values.email
                .trim()
                .toLowerCase(),

                otpCode: values.otpCode.trim(),          
              });

              if (!response.success){
                setError(response.message);
                return response;
              }

              setSucess(true);

              return response;
            }
            catch (error){
                const message = 
                error instanceof Error ? error.message : "Unable to Verify OTP.";

                setError(message);
                return(null);
            }
            finally {
                setIsLoading(false);
            }
            };

            const reset = () => {
                setIsLoading(false);
                setError(null);
                setSucess(false);
            };

            return {
                verifyOTp,
                isLoading,
                error,
                success,
                reset,
            };
        }
    