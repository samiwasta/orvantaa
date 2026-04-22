export type UserGender = "male" | "female"

export function avatarSrcForUserGender(gender: UserGender): string {
  return gender === "male" ? "/boy-avatar.svg" : "/girl-avatar.svg"
}
