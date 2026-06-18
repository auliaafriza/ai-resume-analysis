import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiResponse, ReviewResponse } from "@/features/resume-review/types"

async function postReview(formData: FormData): Promise<ApiResponse<ReviewResponse>> {
  const res = await fetch("/api/review", {
    method: "POST",
    body: formData, // multipart — no Content-Type header; browser sets boundary automatically
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to get review")
  }

  return res.json() as Promise<ApiResponse<ReviewResponse>>
}

export const useMutationReview = () =>
  useMutation({
    mutationFn: postReview,
    onError: (error: Error) => {
      toast.error(error.message ?? "Something went wrong. Please try again.")
    },
  })
