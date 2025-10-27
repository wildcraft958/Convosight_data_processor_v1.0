import React from 'react'

export default function ProgressIndicator({ currentStep, totalSteps = 4 }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {[...Array(totalSteps)].map((_, idx) => {
        const stepNum = idx + 1
        const isActive = stepNum === currentStep
        const isComplete = stepNum < currentStep

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  isComplete
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {isComplete ? '✓' : stepNum}
              </div>
                  <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">Step {stepNum}</div>
            </div>
                {idx < totalSteps - 1 && (
                  <div className={`w-16 h-1 mx-2 mt-[-20px] ${stepNum < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
          </React.Fragment>
        )
      })}
    </div>
  )
}