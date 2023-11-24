const acronymInput = document.getElementById('acronymInput');
const suggestions = document.getElementById('suggestions');
const result = document.querySelector('.result-box');
const contributeForm = document.getElementById('contributeForm');
const newAcronymInput = document.getElementById('newAcronym');
const newMeaningInput = document.getElementById('newMeaning');

async function fetchMeanings(acronym) {
  try {
    const response = await fetch(`/meanings?acronym=${acronym}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to fetch meanings');
    }
  } catch (error) {
    console.error('Error:', error);
    return []; // Return an empty array if there's an error
  }
}

async function displayMeanings(acronym) {
  const meanings = await fetchMeanings(acronym);
  result.innerHTML = meanings.length === 0 ? 'No meanings found' : '';

  meanings.forEach(meaning => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${acronym}</strong>: ${meaning}`;
    result.appendChild(div);
  });
}

function showAcronym(acronym) {
  displayMeanings(acronym);
  acronymInput.value = '';
}

async function fetchSuggestions(text) {
  try {
    const response = await fetch(`/suggestions?text=${text}`);
    if (response.ok) {
      const data = await response.json();
      return data.map(item => item.acronym);
    } else {
      throw new Error('Failed to fetch suggestions');
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

async function displaySearchResults(text) {
  const filteredAcronyms = await fetchSuggestions(text);
  suggestions.innerHTML = '';

  const uniqueAcronyms = [...new Set(filteredAcronyms)]; // Filter out duplicate acronyms

  uniqueAcronyms.forEach(acronym => {
    const li = document.createElement('li');
    li.textContent = acronym;
    li.classList.add('list-group-item');
    li.addEventListener('click', () => showAcronym(acronym));
    suggestions.appendChild(li);
  });
}

acronymInput.addEventListener('input', async () => {
  const inputText = acronymInput.value.trim().toUpperCase();
  if (inputText) {
    await displaySearchResults(inputText);
  } else {
    suggestions.innerHTML = ''; // Clear suggestions if input is empty
  }
});

contributeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newAcronym = newAcronymInput.value.trim().toUpperCase();
  const newMeaning = newMeaningInput.value.trim();

  if (newAcronym && newMeaning) {
    try {
      const response = await fetch('/addAcronym', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newAcronym, newMeaning })
      });

      if (response.ok) {
        newAcronymInput.value = '';
        newMeaningInput.value = '';
        alert('Acronym added successfully!');
      } else {
        alert('Failed to add acronym.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding the acronym.');
    }
  } else {
    alert('Please enter both acronym and meaning.');
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  //await displaySearchResults('');
});
