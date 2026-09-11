"use client";

import React, { useState } from "react";
import type { ClarificationQuestions } from "./CreateAgent";

type Props = {
  questionList: ClarificationQuestions[];
};

const AlAgentQuestions = ({ questionList }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    {}
  );

  if (!questionList || questionList.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No clarification questions available.
        </p>
      </div>
    );
  }

  const currentQuestion = questionList[currentIndex];

  const isLastQuestion = currentIndex === questionList.length - 1;

  const currentAnswer = answers[currentQuestion.id];

  // -----------------------------------------
  // Single Select
  // -----------------------------------------
  const handleSingleSelect = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  // -----------------------------------------
  // Multi Select
  // -----------------------------------------
  const handleMultiSelect = (option: string) => {
    const existingAnswers = Array.isArray(currentAnswer)
      ? currentAnswer
      : [];

    const alreadySelected = existingAnswers.includes(option);

    const newAnswers = alreadySelected
      ? existingAnswers.filter((item) => item !== option)
      : [...existingAnswers, option];

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: newAnswers,
    }));
  };

  // -----------------------------------------
  // Custom text
  // -----------------------------------------
  const handleTextChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  // -----------------------------------------
  // Next
  // -----------------------------------------
  const handleNext = () => {
    if (isLastQuestion) {
      console.log("FINAL ANSWERS:", answers);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  // -----------------------------------------
  // Previous
  // -----------------------------------------
  const handlePrevious = () => {
    if (currentIndex === 0) return;

    setCurrentIndex((prev) => prev - 1);
  };

  // -----------------------------------------
  // Check if answer exists
  // -----------------------------------------
  const hasAnswer =
    Array.isArray(currentAnswer)
      ? currentAnswer.length > 0
      : Boolean(currentAnswer?.trim());

  return (
    <div className="flex w-full justify-center px-4 py-8">
      <div className="w-full max-w-2xl">

        {/* Progress */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Agent Configuration
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              A few questions first
            </h2>
          </div>

          <div className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
            {currentIndex + 1} / {questionList.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${
                ((currentIndex + 1) / questionList.length) * 100
              }%`,
            }}
          />
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">

          {/* Question */}
          <div className="mb-8">
            <span className="mb-3 block text-sm font-medium text-primary">
              Question {currentIndex + 1}
            </span>

            <h3 className="text-xl font-semibold leading-relaxed sm:text-2xl">
              {currentQuestion.question}
            </h3>
          </div>

          {/* -------------------------------- */}
          {/* Single Select */}
          {/* -------------------------------- */}
          {currentQuestion.type === "single_select" && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => {
                const selected = currentAnswer === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSingleSelect(option)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-primary"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>

                    <span className="text-sm font-medium">
                      {option}
                    </span>
                  </button>
                );
              })}

              {/* Custom input */}
              {currentQuestion.allowCustom && (
                <input
                  type="text"
                  placeholder={
                    currentQuestion.customPlaceholder ||
                    "Enter your answer"
                  }
                  value={
                    typeof currentAnswer === "string"
                      ? currentAnswer
                      : ""
                  }
                  onChange={(e) =>
                    handleTextChange(e.target.value)
                  }
                  className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          )}

          {/* -------------------------------- */}
          {/* Multi Select */}
          {/* -------------------------------- */}
          {currentQuestion.type === "multi_select" && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => {
                const selected =
                  Array.isArray(currentAnswer) &&
                  currentAnswer.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleMultiSelect(option)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selected && (
                        <span className="text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <span className="text-sm font-medium">
                      {option}
                    </span>
                  </button>
                );
              })}

              {/* Custom option */}
              {currentQuestion.allowCustom && (
                <input
                  type="text"
                  placeholder={
                    currentQuestion.customPlaceholder ||
                    "Enter your answer"
                  }
                  onChange={(e) => {
                    const value = e.target.value;

                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: value
                        ? [
                            ...(Array.isArray(currentAnswer)
                              ? currentAnswer.filter(
                                  (item) =>
                                    !item.startsWith("custom:")
                                )
                              : []),
                            `custom:${value}`,
                          ]
                        : Array.isArray(currentAnswer)
                        ? currentAnswer.filter(
                            (item) =>
                              !item.startsWith("custom:")
                          )
                        : [],
                    }));
                  }}
                  className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          )}

          {/* -------------------------------- */}
          {/* Text */}
          {/* -------------------------------- */}
          {currentQuestion.type === "text" && (
            <textarea
              value={
                typeof currentAnswer === "string"
                  ? currentAnswer
                  : ""
              }
              onChange={(e) =>
                handleTextChange(e.target.value)
              }
              placeholder={
                currentQuestion.customPlaceholder ||
                "Type your answer..."
              }
              rows={5}
              className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          )}

          {/* -------------------------------- */}
          {/* Number */}
          {/* -------------------------------- */}
          {currentQuestion.type === "number" && (
            <input
              type="number"
              value={
                typeof currentAnswer === "string"
                  ? currentAnswer
                  : ""
              }
              onChange={(e) =>
                handleTextChange(e.target.value)
              }
              placeholder="Enter a number"
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          )}

          {/* -------------------------------- */}
          {/* Date */}
          {/* -------------------------------- */}
          {currentQuestion.type === "date" && (
            <input
              type="date"
              value={
                typeof currentAnswer === "string"
                  ? currentAnswer
                  : ""
              }
              onChange={(e) =>
                handleTextChange(e.target.value)
              }
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          )}

          {/* -------------------------------- */}
          {/* Time */}
          {/* -------------------------------- */}
          {currentQuestion.type === "time" && (
            <input
              type="time"
              value={
                typeof currentAnswer === "string"
                  ? currentAnswer
                  : ""
              }
              onChange={(e) =>
                handleTextChange(e.target.value)
              }
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          )}

          {/* -------------------------------- */}
          {/* Navigation */}
          {/* -------------------------------- */}
          <div className="mt-10 flex items-center justify-between border-t pt-6">

            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!hasAnswer}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLastQuestion ? "Finish ✓" : "Next →"}
            </button>

          </div>
        </div>

        {/* Small helper */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your answers will be used to configure your AI agent.
        </p>
      </div>
    </div>
  );
};

export default AlAgentQuestions;