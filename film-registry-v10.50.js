/* Comic Vault v10.50: additive film-universe registry. Existing datasets remain unchanged. */
(()=>{'use strict';
 const halloween=window.ComicVaultHalloween1031,friday=window.ComicVaultFriday1050;
 if(!halloween)throw new Error('Halloween film data is unavailable.');
 const catalogues=[halloween,...(friday?[friday]:[])],merge=field=>Object.assign({},...catalogues.map(c=>c[field]||{}));
 const appearances=Object.assign({},...catalogues.map(c=>c.filmAppearanceCatalog?.filmAppearances||{}));
 const sources=field=>Object.assign({},...catalogues.map(c=>{const s=c[field]?.sources||{};return Array.isArray(s)?Object.fromEntries(s.map(x=>[x.id,x])):s}));
 window.ComicVaultFilmCatalog1050={
  editorial:merge('editorial'),portraitVariantConfigs:merge('portraitVariantConfigs'),filmSupplements:merge('filmSupplements'),relationshipAdditions:merge('relationshipAdditions'),
  graph:{nodes:Object.assign({},...catalogues.map(c=>c.graph?.nodes||{})),edges:catalogues.flatMap(c=>c.graph?.edges||[]),sources:sources('graph')},
  filmAppearanceCatalog:{schemaVersion:1,filmAppearances:appearances,sources:sources('filmAppearanceCatalog')},
  movieTrivia:{films:catalogues.flatMap(c=>c.movieTrivia?.films||[]),sources:sources('movieTrivia')}
 };
 const baseline=window.ComicVaultMovieDetails1046||{},added=friday?.movieDetails||{};
 window.ComicVaultFilmDetails1050={version:'10.50',movies:{...baseline.movies,...added.movies},characterSnapshots:{...baseline.characterSnapshots,...added.characterSnapshots}};
 window.ComicVaultFilmUniverses1050={HALLOWEEN:{label:'Halloween',filmIds:Object.keys(baseline.movies||{})},FRIDAY13:{label:'Friday the 13th',filmIds:(friday?.filmCards||[]).map(f=>f.id)}};
})();
