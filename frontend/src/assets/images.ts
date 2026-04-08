// Stitch design images — served from /public/images/stitch/
// Use these constants instead of external lh3.googleusercontent.com URLs

const BASE = '/images/stitch'

export const IMG = {
  // Backgrounds
  bgCampusDusk:         `${BASE}/bg-campus-dusk.jpg`,
  bgNetworkPattern:     `${BASE}/bg-network-pattern.jpg`,
  bgUniversityLibrary:  `${BASE}/bg-university-library.jpg`,

  // Admin avatars
  avatarAdminDrSarah:   `${BASE}/avatar-admin-dr-sarah.jpg`,
  avatarAdminDoctor:    `${BASE}/avatar-admin-doctor-profile.jpg`,
  avatarAdminBusiness:  `${BASE}/avatar-admin-business.jpg`,
  avatarAdminMale1:     `${BASE}/avatar-admin-male-1.jpg`,
  avatarAdminMale2:     `${BASE}/avatar-admin-male-2.jpg`,
  avatarAdminFemaleSys: `${BASE}/avatar-admin-female-sys.jpg`,
  avatarAdminCampus1:   `${BASE}/avatar-admin-campus-1.jpg`,
  avatarAdminCampus2:   `${BASE}/avatar-admin-campus-2.jpg`,
  avatarAcademicDean:   `${BASE}/avatar-academic-dean.jpg`,
  avatarCloseUp:        `${BASE}/avatar-close-up.jpg`,

  // Student avatars
  avatarStudentAlexCampus: `${BASE}/avatar-student-alex-campus.jpg`,
  avatarStudentProfile:    `${BASE}/avatar-student-profile.jpg`,
  avatarStudentMale1:      `${BASE}/avatar-student-male-1.jpg`,
  avatarStudentGlasses:    `${BASE}/avatar-student-glasses.jpg`,
  avatarStudent2:          `${BASE}/avatar-student-2.jpg`,
  avatarStudent3:          `${BASE}/avatar-student-3.jpg`,
  avatarStudent4:          `${BASE}/avatar-student-4.jpg`,
  avatarStudent5:          `${BASE}/avatar-student-5.jpg`,

  // Named user avatars (from booking tables etc.)
  avatarUserAlex:  `${BASE}/avatar-user-alex.jpg`,
  avatarUserPriya: `${BASE}/avatar-user-priya.jpg`,
  avatarUserRohan: `${BASE}/avatar-user-rohan.jpg`,

  // Technician avatars
  avatarTechMale1:   `${BASE}/avatar-tech-male-1.jpg`,
  avatarTechFemale1: `${BASE}/avatar-tech-female-1.jpg`,
  avatarTechMale2:   `${BASE}/avatar-tech-male-2.jpg`,
  avatarTechFemale2: `${BASE}/avatar-tech-female-2.jpg`,
  avatarTechUniform: `${BASE}/avatar-tech-uniform.jpg`,
  avatarTechJohn:    `${BASE}/avatar-tech-john.jpg`,

  // Incident photos
  incidentAcUnit:        `${BASE}/incident-ac-unit.jpg`,
  incidentDamagedOutlet: `${BASE}/incident-damaged-outlet.jpg`,
  incidentFloorPlan:     `${BASE}/incident-floor-plan.jpg`,
  incidentCharredOutlet: `${BASE}/incident-charred-outlet.jpg`,

  // Resource photos
  resourceAuditorium:  `${BASE}/resource-auditorium.jpg`,
  resourceComputerLab: `${BASE}/resource-computer-lab.jpg`,
  resourceBoardroom:   `${BASE}/resource-boardroom.jpg`,
  resourcePhysicsLab:  `${BASE}/resource-physics-lab.jpg`,
  resourceProjector:   `${BASE}/resource-projector.jpg`,
  resourceSeminar:     `${BASE}/resource-seminar.jpg`,
  resourceCowork:      `${BASE}/resource-cowork.jpg`,
  resourceLab2:        `${BASE}/resource-lab-2.jpg`,
  resourceMeetingRoom: `${BASE}/resource-meeting-room.jpg`,
} as const

export type ImgKey = keyof typeof IMG

/** Pick a resource background image based on resource type */
export function resourceImage(type?: string): string {
  switch (type) {
    case 'LECTURE_HALL': return IMG.resourceAuditorium
    case 'LAB':          return IMG.resourcePhysicsLab
    case 'MEETING_ROOM': return IMG.resourceBoardroom
    case 'EQUIPMENT':    return IMG.resourceProjector
    default:             return IMG.resourceCowork
  }
}
