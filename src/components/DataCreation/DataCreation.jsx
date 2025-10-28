import React, { useState } from 'react'
import ProgressIndicator from '../common/ProgressIndicator'
import Step1ExtractUsernames from './Step1ExtractUsernames'
import Step2CreateTable from './Step2CreateTable'
import Step3MatchFill from './Step3MatchFill'
import Step4FillCategory from './Step4FillCategory'

export default function DataCreation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [step1Data, setStep1Data] = useState(null)
  const [step2Data, setStep2Data] = useState(null)
  const [step3Data, setStep3Data] = useState(null)

  return (
    <div className="pb-4">
      <ProgressIndicator currentStep={currentStep} totalSteps={4} />

      {currentStep === 1 && (
        <Step1ExtractUsernames 
          onNext={(data) => {
            setStep1Data(data)
            setCurrentStep(2)
          }}
        />
      )}

      {currentStep === 2 && (
        <Step2CreateTable 
          onPrevious={() => setCurrentStep(1)}
          onNext={(data) => {
            setStep2Data(data)
            setCurrentStep(3)
          }}
        />
      )}

      {currentStep === 3 && (
        <Step3MatchFill 
          initialData={step2Data}
          onPrevious={() => setCurrentStep(2)}
          onNext={(data) => {
            setStep3Data(data)
            setCurrentStep(4)
          }}
        />
      )}

      {currentStep === 4 && (
        <Step4FillCategory 
          initialData={step3Data}
          onPrevious={() => setCurrentStep(3)}
        />
      )}
    </div>
  )
}