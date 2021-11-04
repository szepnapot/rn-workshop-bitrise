import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '../App';
import { maxLives, maxQuestions } from '../config';
import fetch from 'jest-fetch-mock';
import { IResponse } from '../interfaces';

const mockResponse: IResponse = {
  response_code: 0,
  results: [
    {
      question: 'Do you enjoy this workshop??',
      correct_answer: 'YES',
      incorrect_answers: ['No', 'Not really', 'Maybe'],
      category: 'tech',
      difficulty: 'easy',
      type: 'multiple',
    },
  ],
};

describe('App', () => {
  beforeEach(() => {
    fetch.mockResponse(JSON.stringify(mockResponse));
  });

  it('should all lives by default', async () => {
    const { findAllByTestId } = render(<App />);
    const hearts = await findAllByTestId('heart-full');

    expect(hearts).toHaveLength(maxLives);
  });

  it('should show first step text', async () => {
    const { findByTestId } = render(<App />);

    const currentStep = await findByTestId('currentStep');

    expect(currentStep.props.children).toEqual(`1 / ${maxQuestions}`);
  });

  it('should decrease lives when incorrect selected', async () => {
    const { findByTestId, getByText, getAllByTestId } = render(<App />);

    const question = await findByTestId('question');

    expect(question.props.children).toEqual('Do you enjoy this workshop??');

    const incorrectButton = getByText('Not really');

    fireEvent.press(incorrectButton);

    const hearts = getAllByTestId('heart-full');
    const emptyHearts = getAllByTestId('heart-empty');

    expect(hearts).toHaveLength(maxLives - 1);
    expect(emptyHearts).toHaveLength(1);
  });

  it('should increase stepCounter if correct answer selected', async () => {
    const { getByText, getByTestId } = render(<App />);

    const correctButton = await waitFor(() =>
      getByText(mockResponse.results[0].correct_answer)
    );

    fireEvent.press(correctButton);

    const nextStep = getByTestId('currentStep');
    // const nextStep = getByText('`2 / ${maxQuestions}`')

    expect(nextStep.props.children).toEqual(`2 / ${maxQuestions}`);
  });
});
