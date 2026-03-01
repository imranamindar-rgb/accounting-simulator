import { create } from 'zustand'
import { MISSIONS } from '../data/missions'

interface MissionProgress {
  activeMissionId: string
  activeStepIndex: number
  /** Keyed by `${missionId}:${stepId}` */
  reflections: Record<string, string>
  /** Keyed by missionId: highest completed step index (exclusive). */
  completedThroughStep: Record<string, number>

  selectMission: (missionId: string) => void
  goToStep: (index: number) => void
  completeCurrentStep: () => void
  setReflection: (missionId: string, stepId: string, text: string) => void
  resetMission: (missionId?: string) => void
}

const defaultMissionId = MISSIONS[0]?.id ?? 'mission'

export const useMissionStore = create<MissionProgress>()((set, get) => ({
  activeMissionId: defaultMissionId,
  activeStepIndex: 0,
  reflections: {},
  completedThroughStep: {},

  selectMission: (missionId) =>
    set((state) => ({
      activeMissionId: missionId,
      activeStepIndex: 0,
      // Keep reflections and completed state so a learner can resume.
      reflections: state.reflections,
      completedThroughStep: state.completedThroughStep,
    })),

  goToStep: (index) =>
    set(() => ({
      activeStepIndex: Math.max(0, index),
    })),

  completeCurrentStep: () => {
    const { activeMissionId, activeStepIndex, completedThroughStep } = get()
    const currentBest = completedThroughStep[activeMissionId] ?? 0
    const nextBest = Math.max(currentBest, activeStepIndex + 1)
    set({
      completedThroughStep: {
        ...completedThroughStep,
        [activeMissionId]: nextBest,
      },
      activeStepIndex: activeStepIndex + 1,
    })
  },

  setReflection: (missionId, stepId, text) =>
    set((state) => ({
      reflections: {
        ...state.reflections,
        [`${missionId}:${stepId}`]: text,
      },
    })),

  resetMission: (missionId) =>
    set((state) => {
      const target = missionId ?? state.activeMissionId
      const nextCompleted = { ...state.completedThroughStep }
      delete nextCompleted[target]

      const nextReflections: Record<string, string> = {}
      for (const [k, v] of Object.entries(state.reflections)) {
        if (!k.startsWith(`${target}:`)) nextReflections[k] = v
      }

      return {
        completedThroughStep: nextCompleted,
        reflections: nextReflections,
        activeStepIndex: state.activeMissionId === target ? 0 : state.activeStepIndex,
      }
    }),
}))

