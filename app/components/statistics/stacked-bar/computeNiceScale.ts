export function computeNiceScale(
  rawMax: number,
  targetSteps: number,
): { niceMax: number; niceStep: number; steps: number } {
  if (rawMax <= 0) return { niceMax: targetSteps, niceStep: 1, steps: targetSteps };

  const roughStep = rawMax / targetSteps;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceStep: number;
  if (residual <= 1.5) niceStep = magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  niceStep = Math.max(1, niceStep);

  const niceMax = Math.ceil(rawMax / niceStep) * niceStep;
  const steps = Math.round(niceMax / niceStep);

  return { niceMax, niceStep, steps };
}
