import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StepsService {
  step1 = signal(true);
  step2 = signal(false);
  step3 = signal(false);
  step4 = signal(false);
  step5 = signal(false);

  step1Success = signal(false);
  step2Success = signal(false);
  step3Success = signal(false);
  step4Success = signal(false);
  step5Success = signal(false);

  // Signal to track step validation status
  stepValidation = signal<boolean>(false);

  // Signal to track the current step
  currentStep = signal<number>(0);

  rutinaId = signal<number>(0);

  // Method to update the step validation status
  updateStepValidation(isValid: boolean) {
    this.stepValidation.set(isValid);
  }

  
  updateStepRutina(rutinaId: number) {
    this.rutinaId.set(rutinaId);
  }


  // Method to update the current step
  updateCurrentStep(step: number) {
    this.currentStep.set(step);
    this.updateStepSuccess(step);
  }
  private updateStepSuccess(step: number) {
    this.step1Success.set(step > 0);
    this.step2Success.set(step > 1);
    this.step3Success.set(step > 2);
    this.step4Success.set(step > 3);
    this.step5Success.set(step > 4);
  }

  setStep1(success: boolean) {
    this.step1.set(success);
  }

  setStep2(success: boolean) {
    this.step2.set(success);
  }

  setStep3(success: boolean) {
    this.step3.set(success);
  }

  setStep4(success: boolean) {
    this.step4.set(success);
  }

  setStep5(success: boolean) {
    this.step5.set(success);
  }

  setStep1Success(success: boolean) {
    this.step1Success.set(success);
  }

  setStep2Success(success: boolean) {
    this.step2Success.set(success);
  }

  setStep3Success(success: boolean) {
    this.step3Success.set(success);
  }

  setStep4Success(success: boolean) {
    this.step4Success.set(success);
  }

  setStep5Success(success: boolean) {
    this.step5Success.set(success);
  }

   setInitialStep(step: number) {
    this.currentStep.set(step);
  }
}
