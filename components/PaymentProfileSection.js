import React from "react";
import { FaPen, FaSpinner } from "react-icons/fa";
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
        {isOwner && (
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                className="w-full bg-background text-text text-sm text-center rounded-lg p-3 pr-8 focus:outline-none transition-all duration-200 border-0 placeholder-text/40"
                value={currentUser.perk || ""}
                onClick={() => setIsEditing(true)}
                onFocus={() => setIsEditing(true)}
                onChange={(e) => setcurrentUser({ ...currentUser, perk: e.target.value })}
                onBlur={handleSavePerk}
                placeholder="Set your perk for top donors..."
              />
              <FaPen className="absolute top-1/2 right-3 transform -translate-y-1/2 text-text/40 text-xs pointer-events-none" />
            </div>
          </div>
        )}

        {/* Perk Display for Non-Owners */}
        {!isOwner && isEventActive && currentUser.perk && (
          <div className="mt-4 bg-black p-3 rounded-lg">
            <div className="text-text/90 text-sm text-center">
              🎁 <span className="font-medium text-primary/40">Top 5 Perk : </span> {currentUser.perk}
            </div>
          </div>
        )}

        {/* Owner-only controls */}
        {isOwner && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <input 
                type="number" 
                placeholder="Duration in days" 
                value={eventDuration} 
                onChange={(e) => setEventDuration(e.target.value)}
                className="w-full sm:min-w-[160px] sm:flex-1 px-3 py-2 bg-background text-text rounded-lg focus:outline-none transition-all duration-200 border-0 placeholder-text/40"
              />
              <button onClick={handleStartEvent} className="w-full sm:w-auto bg-success hover:bg-success/90 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                Start Event
              </button>
              <button onClick={handleEndEvent} className="w-full sm:w-auto bg-error hover:bg-error/90 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                End Event
              </button>
            </div>
          </div>
        )}

        {/* Event Timer */}
        {currentUser.eventEnd && timeLeft && (
          <div className="mt-3 text-center bg-background/50 text-text/80 text-sm py-2 px-3 rounded-lg shadow-sm">
            <span className="font-medium text-primary">Event is live!</span> Ends in: <span className="font-medium">{timeLeft}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentProfileSection;
