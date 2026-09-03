import { useState } from "react";

import type {
    RegisterTrainerRequest
} from "@repo/types"

import type {
    AuthApi
} from "@repo/api"

export interface RegsiterTrainer {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
    specialization : string;
    yearsofExperience: string;
    certificateNumbeR: string;
    certificateName: string;
    profileImage: File;
}