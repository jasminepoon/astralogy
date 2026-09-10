# Can a machine propose a useful new measurement?

Working note · 10 September 2026

This develops the idea from our conversation. The proposals below are hypotheses and design judgments, with their reasons and possible failure conditions. No experiment has been run.

The question: **Can a machine discover a quantity that researchers can repeatedly measure and use to anticipate how a system will respond?**

### 1. The interesting step is making a learned feature reusable

A model could combine images and sensor readings into an internal score, S. That alone would not establish a new scientific measurement. The stronger outcome would be a defined procedure that lets someone else estimate S, compare it across experiments, and use it for a stated purpose.

**Why:** A private feature can help a particular predictor without becoming useful outside it. A measurement needs a stable meaning in practice: what inputs it requires, how its scale is defined, how uncertain it is, and where it works.

The first correction to our idea is therefore to focus on the transition from a candidate feature to a reusable measurement.

### 2. Define the purpose through a response

In the hypothetical cell-culture example, begin with a narrow question: can we predict recovery after a specified, controlled disturbance over a fixed time period?

The system would receive observations from before the disturbance and propose a compact state description. Its predictions would then be tested against subsequent outcomes.

**Why:** “Discover interesting structure” permits almost any pattern to count as success. A specified response gives us something that can prove the proposed description inadequate. It also prevents future outcome information from quietly entering the measurement.

S should initially mean only “a candidate quantity useful for predicting this response.” Calling it resilience or health would claim more than we have established.

### 3. A response profile may be more useful than one score

We should allow several learned quantities. Two cultures might respond similarly to one disturbance and differently to another. A single ranking could hide that distinction.

**Why:** Choosing a scalar in advance is itself a human constraint on the representation. The original idea was to relax such constraints. We can prefer compact descriptions without insisting that everything fits on one axis.

A promising test would be whether a description learned from several responses helps predict another response with relatively little additional data. That is a proposal to test, not an assumed capability.

### 4. Reusability needs a deliberately difficult test

Freeze the measurement procedure before testing it on independent experimental batches. Then separately test changes in acquisition conditions and changes in the system itself.

**Why:** We want to distinguish sensitivity to the phenomenon from sensitivity to the camera, operator, or batch. Acquisition changes should preserve the reading only when they preserve the relevant information; some changes may instead require recalibration.

The proposed measurement should be compared with ordinary measured variables, simple combinations of them, and a capable predictor using the same available input data. Independent cultures or batches—not neighboring frames of the same recording—should define the test split.

**What would weaken the idea:** The advantage disappears on new batches, comes entirely from extra input data, or offers no practical benefit over an existing measurement. A compact representation need not beat every predictor, but it must earn its place through accuracy, reliability, lower data requirements, or experimental usefulness.

### 5. Predicting an intervention does not make S a cause

Even if S predicts responses to randomized interventions, S could summarize several underlying processes. Changing the displayed score is not a physical operation, and changing something correlated with it may not change the outcome.

**Why:** We should separate three achievements: useful prediction, reusable measurement, and a causal explanation. Evidence for one does not automatically establish the others.

Mechanistic follow-up would ask which physical changes alter the reading and whether their consequences agree with our hypotheses. There may never be one physical knob corresponding to S.

### 6. The instrument should carry its own test record

A first research tool could take time-stamped observations and return a candidate measurement, an uncertainty estimate, and a record of the conditions under which it has been evaluated. It should also identify experiments where competing explanations predict different outcomes.

**Why:** A precise-looking number invites trust. Its experimental record gives researchers a reason to trust it—or grounds to reject it. Choosing a discriminating experiment makes the representation accountable to a new observation.

Before broad deployment, the output should include a frozen, versioned measurement procedure and reference samples or another calibration method. Updating the model should not silently change the meaning of yesterday's readings.

### 7. Learning the variables already has precedents

Champion and colleagues developed a method that jointly learns reduced coordinates and sparse dynamical equations. This establishes a concrete precedent for learning a representation alongside dynamics. [Data-driven discovery of coordinates and governing equations, 2019](https://pubmed.ncbi.nlm.nih.gov/31636218/).

Chen and colleagues reported discovering candidate state variables and estimating intrinsic dimensionality from videos of physical dynamical systems. This directly overlaps with the original intuition. [Automated discovery of fundamental variables hidden in experimental data, 2022](https://www.nature.com/articles/s43588-022-00281-6).

**Why this changes the framing:** We should not claim that having AI invent variables is new. Our narrower question is how to qualify a learned quantity for repeated experimental use. These papers are precedents, not evidence that the proposed cell-culture instrument will work, and this is not an exhaustive novelty review.

### Current position

The valuable possibility is a repeatable process for proposing and testing new measurements. A successful first result would be modest: one frozen procedure that captures a useful distinction, survives independent experiments, and helps researchers make a better experimental decision.

The unresolved question is whether the learned description provides reusable scientific value beyond its original prediction task. That should determine what we build and how we evaluate it.
