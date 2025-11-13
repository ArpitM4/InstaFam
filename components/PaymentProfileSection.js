import React from "react";
import { FaPen, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import FollowButton from "./FollowButton";

const PaymentProfileSection = ({
  username,
  currentUser,
  isOwner,
  isUploadingProfile,
  isUploadingCover,
  profileInputRef,
  coverInputRef,
  handleProfileChange,
  handleCoverChange,
  isEditing,
  setIsEditing,
  handleSaveDescription,
  eventDuration,
  setEventDuration,
  handleStartEvent,
  handleEndEvent,
  timeLeft,
  handleSavePerk,
  setcurrentUser,
  isEventActive,
  setShowBetaPopup,
}) => {
  return (
    <>
      {/* Banner with full width and profile image overlapping bottom edge */}
      <div className="relative w-full mx-auto">
        {/* Background image with upload for owner and change banner button */}
        <div
          className={`w-full h-64 md:h-72 lg:h-80 bg-cover bg-center shadow-md relative ${isOwner ? '' : ''}`}
          style={{ backgroundImage: `url(${currentUser?.coverpic || "https://picsum.photos/1600/400"})` }}
        >
          <div className="absolute inset-0 bg-background/40" />
          {isOwner && (
            <>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={coverInputRef}
                onChange={handleCoverChange}
                disabled={isUploadingCover}
              />
              <button
                type="button"
                className={`absolute bottom-4 right-4 z-10 bg-primary text-text px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition font-semibold text-sm flex items-center gap-2 ${isUploadingCover ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => !isUploadingCover && coverInputRef.current.click()}
                disabled={isUploadingCover}
              >
                {isUploadingCover ? <FaSpinner className="animate-spin text-text text-lg" /> : null}
                Change Banner
              </button>
            </>
          )}
        </div>
        {/* Profile image, centered and overlapping bottom edge, with upload for owner */}
        <div className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-1/2 flex justify-center items-center w-full pointer-events-none">
          <div className={`w-36 h-36 md:w-40 md:h-40 bg-text rounded-full shadow-lg border-4 border-text overflow-hidden flex items-center justify-center relative ${isOwner ? 'group cursor-pointer' : ''}`}
            onClick={isOwner && !isUploadingProfile ? () => profileInputRef.current.click() : undefined}
            style={{ opacity: isUploadingProfile ? 0.6 : 1 }}
          >
            <img
              src={currentUser?.profilepic || "https://picsum.photos/200"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              style={{ filter: isUploadingProfile ? 'blur(2px)' : 'none' }}
            />
            {isOwner && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={profileInputRef}
                  onChange={handleProfileChange}
                  disabled={isUploadingProfile}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                  <div className="bg-background/70 backdrop-blur-md rounded-full p-3 flex items-center justify-center">
                    {isUploadingProfile ? <FaSpinner className="animate-spin text-primary text-xl" /> : <FaPen className="text-xl text-primary" />}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Add margin below the banner to account for the overlapping profile image */}
      <div className="h-20" />

      {/* Profile Info Box */}
      <div className="relative mt-20 w-full max-w-md mx-auto p-4 bg-dropdown-hover rounded-lg shadow-sm">
        <h1 className="text-xl font-light text-primary text-center mb-3">@{username}</h1>
        
        {/* Follower Count for Creator's Own Page */}
        {isOwner && (
          <div className="flex justify-center mb-3">
            <span className="text-sm text-text/60 bg-background/50 px-3 py-1 rounded-lg">
              {(currentUser.followersArray?.length || currentUser.followers || 0).toLocaleString()} follower{(currentUser.followersArray?.length || currentUser.followers || 0) !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        {/* Follow Button */}
        <div className="flex justify-center mb-1">
          <FollowButton 
            creatorId={currentUser._id}
            creatorName={username}
            initialFollowerCount={currentUser.followersArray?.length || currentUser.followers || 0}
            showFollowerCount={false} // We're showing it separately above for creators
            onFollowChange={(isFollowing, newCount) => {
              // Update local state to reflect changes
              setcurrentUser(prev => ({
                ...prev,
                followers: newCount,
                followersArray: prev.followersArray || []
              }));
            }}
          />
        </div>
        
        {/* Description */}
        {isOwner ? (
          <div className="relative">
            <textarea
              className="w-full mt-1 bg-background text-text text-sm text-center rounded-lg p-2 pb-6 resize-none focus:outline-none transition-all duration-200 border-0 placeholder-text/40"
              value={currentUser.description || ""}
              onChange={(e) => setcurrentUser({ ...currentUser, description: e.target.value })}
              onBlur={handleSaveDescription}
              placeholder="Add a description..."
            />
            <FaPen className="absolute bottom-2 right-2 text-text/40 text-xs pointer-events-none" />
          </div>
        ) : (
          <p className="text-sm text-text/60 text-center mt-2">{currentUser.description}</p>
        )}

        {/* Perk Section - Combined Display and Edit */}
        {/* COMMENTED OUT - Perk feature temporarily disabled */}
        {/* {isOwner && (
          <div className="mt-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                className={`w-full bg-background text-text text-sm text-center rounded-lg p-3 pr-8 focus:outline-none transition-all duration-200 border-0 placeholder-text/40 ${isEventActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={currentUser.perk || ""}
                onClick={() => !isEventActive && setIsEditing(true)}
                onFocus={() => !isEventActive && setIsEditing(true)}
                onChange={(e) => !isEventActive && setcurrentUser({ ...currentUser, perk: e.target.value })}
                onBlur={!isEventActive ? handleSavePerk : undefined}
                placeholder={isEventActive ? "Cannot edit perk during active event" : "Set your perk for top donors..."}
                disabled={isEventActive}
                readOnly={isEventActive}
              />
              <FaPen className={`absolute top-1/2 right-3 transform -translate-y-1/2 text-xs pointer-events-none ${isEventActive ? 'text-text/20' : 'text-text/40'}`} />
            </div>
            
            <div className="flex items-center gap-3">
              <label className={`text-text/70 text-sm font-medium whitespace-nowrap ${isEventActive ? 'opacity-50' : ''}`}>Perk for Top</label>
              <input
                type="number"
                min="1"
                max="100"
                className={`flex-1 bg-background text-text text-sm text-center rounded-lg p-2 focus:outline-none transition-all duration-200 border-0 placeholder-text/40 ${isEventActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={currentUser.perkRank || 5}
                onChange={(e) => {
                  if (!isEventActive) {
                    const value = Math.min(Math.max(1, Number(e.target.value)), 100);
                    setcurrentUser({ ...currentUser, perkRank: value });
                  }
                }}
                onBlur={!isEventActive ? handleSavePerk : undefined}
                placeholder="5"
                disabled={isEventActive}
                readOnly={isEventActive}
              />
              <span className={`text-text/70 text-sm ${isEventActive ? 'opacity-50' : ''}`}>donors</span>
            </div>
            <p className={`text-text/50 text-xs text-center ${isEventActive ? 'opacity-50' : ''}`}>
              {isEventActive 
                ? "Perk settings are locked during active events" 
                : "Top donors will be highlighted in the leaderboard and eligible for your perk"
              }
            </p>
          </div>
        )} */}

        {/* Perk Display for Non-Owners */}
        {/* COMMENTED OUT - Perk feature temporarily disabled */}
        {/* {!isOwner && isEventActive && currentUser.perk && (
          <div className="mt-4 bg-black p-3 rounded-lg">
            <div className="text-text/90 text-sm text-center">
              🎁 <span className="font-medium text-primary/40">Top {currentUser.perkRank || 5} Perk : </span> {currentUser.perk}
            </div>
          </div>
        )} */}

        {/* Owner-only controls */}
        {isOwner && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <input 
                type="number" 
                placeholder={isEventActive ? "Event is running" : "Duration in days"} 
                value={eventDuration} 
                onChange={(e) => !isEventActive && setEventDuration(e.target.value)}
                className={`w-full sm:min-w-[160px] sm:flex-1 px-3 py-2 bg-background text-text rounded-lg focus:outline-none transition-all duration-200 border-0 placeholder-text/40 ${isEventActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isEventActive}
                readOnly={isEventActive}
              />
              <button 
                onClick={handleStartEvent} 
                disabled={isEventActive || !eventDuration}
                className={`w-full sm:w-auto px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                  isEventActive || !eventDuration 
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50' 
                    : 'bg-success hover:bg-success/90 text-white hover:shadow-md'
                }`}
              >
                {isEventActive ? 'Event Active' : 'Start Event'}
              </button>
              <button 
                onClick={handleEndEvent} 
                disabled={!isEventActive}
                className={`w-full sm:w-auto px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                  !isEventActive 
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50' 
                    : 'bg-error hover:bg-error/90 text-white hover:shadow-md'
                }`}
              >
                End Event
              </button>
            </div>
            {isEventActive && (
              <p className="text-center text-xs text-text/50">Event settings are locked while event is running</p>
            )}
          </div>
        )}

        {/* Event Timer */}
        {currentUser.eventEnd && timeLeft && (
          <div className="mt-3 text-center bg-background/50 text-text/80 text-sm py-2 px-3 rounded-lg shadow-sm">
            <button
              onClick={() => setShowBetaPopup && setShowBetaPopup(true)}
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <FaExclamationTriangle className="text-red-500 text-xs" />
              <span className="font-medium text-green-500">Event is not Live!</span>
            </button>
            <span className="ml-2">Ends in: <span className="font-medium">{timeLeft}</span></span>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentProfileSection;
